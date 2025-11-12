import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma.config";
import { randomUUID } from "crypto";

describe("TweetController - Testes de Integração", () => {
  const baseUrl = "/api/tweets";
  let token: string;
  let userId: string;
  let tweetId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.like.deleteMany();
    await prisma.tweet.deleteMany();
    await prisma.user.deleteMany();

    const userRes = await request(app)
      .post("/api/users")
      .send({
        name: "Tweet User",
        userName: `tweet_${Date.now()}`,
        email: `tweet_${Date.now()}@test.com`,
        password: "123456",
        imageUrl: "https://placekitten.com/200/200",
      });

    userId = userRes.body.user.id;

    const loginRes = await request(app).post("/api/users/login").send({
      identifier: userRes.body.user.email,
      password: "123456",
    });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await prisma.follow.deleteMany();
    await prisma.like.deleteMany();
    await prisma.tweet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("POST /api/tweets - criarTweet", () => {
    it("deve criar um tweet com sucesso", async () => {
      const res = await request(app)
        .post(baseUrl)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Meu primeiro tweet" });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.tweet).toHaveProperty("id");
      expect(res.body.tweet.content).toBe("Meu primeiro tweet");

      tweetId = res.body.tweet.id;
    });

    it("deve retornar erro 400 ao tentar criar tweet sem conteúdo", async () => {
      const res = await request(app)
        .post(baseUrl)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("O conteúdo do tweet é obrigatório");
    });

    it("deve retornar erro 401 ao tentar criar tweet sem token", async () => {
      const res = await request(app).post(baseUrl).send({
        content: "Tentando criar sem autenticação",
      });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Token de autenticação não fornecido");
    });
  });

  describe("POST /api/tweets/:parentId/reply - criarReply", () => {
    it("deve criar uma reply com sucesso", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${tweetId}/reply`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Minha resposta ao tweet!" });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toMatch(/Resposta criada com sucesso/i);
      expect(res.body.reply.parentId).toBe(tweetId);
    });

    it("deve falhar ao criar reply com UUID inválido", async () => {
      const res = await request(app)
        .post(`${baseUrl}/uuid_invalido/reply`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "UUID errado" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toMatch(/é inválido ou ausente/i);
    });

    it("deve falhar ao criar reply sem token", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${tweetId}/reply`)
        .send({ content: "Sem autenticação" });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it("deve falhar ao criar reply com conteúdo vazio", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${tweetId}/reply`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });

    it("deve falhar ao criar reply para tweet inexistente", async () => {
      const fakeId = randomUUID();
      const res = await request(app)
        .post(`${baseUrl}/${fakeId}/reply`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Tweet não existe" });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toMatch(/não foi encontrado/);
    });
  });

  describe("GET /api/tweets/feed - buscarFeedUsuario", () => {
    beforeAll(async () => {
      const otherRes = await request(app)
        .post("/api/users")
        .send({
          name: "Outro User",
          userName: `other_${Date.now()}`,
          email: `other_${Date.now()}@test.com`,
          password: "123456",
        });

      const otherId = otherRes.body.user.id;

      await prisma.follow.create({
        data: {
          followerId: userId,
          followingId: otherId,
        },
      });

      await prisma.tweet.create({
        data: {
          content: "Tweet do outro usuário",
          userId: otherId,
        },
      });
    });

    it("deve retornar o feed do usuário autenticado com tweets próprios e de seguidos", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.feed)).toBe(true);
      expect(res.body.feed.length).toBeGreaterThan(0);

      const autores = res.body.feed.map((t: any) => t.user.userName);
      expect(autores.some((n: string) => n.includes("tweet_"))).toBe(true);
      expect(autores.some((n: string) => n.includes("other_"))).toBe(true);
    });

    it("deve incluir replies no feed se existirem", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.feed.some((t: any) => t.replies?.length > 0)).toBe(true);
    });

    it("deve retornar erro 401 se o token não for enviado", async () => {
      const res = await request(app).get(`${baseUrl}/feed`);
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Token de autenticação não fornecido");
    });

    it("deve retornar erro 401 se o token for inválido", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", "Bearer tokenInvalido123");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Token inválido");
    });
  });
});
