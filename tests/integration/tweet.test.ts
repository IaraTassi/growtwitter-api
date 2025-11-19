import request from "supertest";
import { prisma } from "../../src/config/prisma.config";
import { limparBanco } from "../setup";
import app from "../../src/app";

describe("TweetController - Testes de Integração Avançados", () => {
  const baseUrl = "/api/tweets";
  let token: string;
  let userId: string;
  let otherId: string;
  let tweetId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await limparBanco();
  });

  afterAll(async () => {
    await limparBanco();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await limparBanco();

    const resUser = await request(app)
      .post("/api/users")
      .send({
        name: "Tweet User",
        userName: `tweet_${Date.now()}`,
        email: `tweet_${Date.now()}@test.com`,
        password: "123456",
        imageUrl: "https://placekitten.com/200/200",
      });
    userId = resUser.body.user.id;

    const loginRes = await request(app)
      .post("/api/users/login")
      .send({ identifier: resUser.body.user.email, password: "123456" });
    token = loginRes.body.token;

    const resOther = await request(app)
      .post("/api/users")
      .send({
        name: "Other User",
        userName: `other_${Date.now()}`,
        email: `other_${Date.now()}@test.com`,
        password: "123456",
        imageUrl: "https://placekitten.com/200/200",
      });
    otherId = resOther.body.user.id;

    await prisma.follow.create({
      data: { followerId: userId, followingId: otherId },
    });

    const tweetRes = await prisma.tweet.create({
      data: { content: "Tweet principal", userId },
    });
    tweetId = tweetRes.id;

    const otherTweet = await prisma.tweet.create({
      data: { content: "Tweet do other", userId: otherId },
    });

    const reply1 = await prisma.tweet.create({
      data: { content: "Reply teste", userId, parentId: tweetId },
    });
    await prisma.tweet.create({
      data: { content: "Reply da reply", userId: otherId, parentId: reply1.id },
    });
  });

  describe("POST /api/tweets - criarTweet", () => {
    it("deve criar um tweet com sucesso", async () => {
      const res = await request(app)
        .post(baseUrl)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Novo tweet completo" });

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.tweet).toHaveProperty("id");
      expect(res.body.tweet.content).toBe("Novo tweet completo");
      expect(res.body.tweet.userId).toBe(userId);
      expect(res.body.message).toBe("Tweet criado com sucesso.");
    });

    it("deve falhar com conteúdo vazio", async () => {
      const res = await request(app)
        .post(baseUrl)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O conteúdo do tweet é obrigatório.");
    });

    it("deve falhar com conteúdo ausente", async () => {
      const res = await request(app)
        .post(baseUrl)
        .set("Authorization", `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O conteúdo do tweet é obrigatório.");
    });

    it("deve falhar sem token", async () => {
      const res = await request(app).post(baseUrl).send({ content: "Tweet" });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar se token inválido", async () => {
      const res = await request(app)
        .post(baseUrl)
        .set("Authorization", "Bearer inválido")
        .send({ content: "Tweet" });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Token inválido ou expirado.");
    });

    it("deve falhar se conteúdo exceder limite de caracteres", async () => {
      const longContent = "a".repeat(281);
      const res = await request(app)
        .post(baseUrl)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: longContent });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "O tweet não pode ter mais de 280 caracteres."
      );
    });
  });

  describe("GET /api/tweets/:id - buscarPorId", () => {
    it("deve retornar um tweet com sucesso", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${tweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.tweet.id).toBe(tweetId);
      expect(res.body.message).toBe("Tweet buscado com sucesso.");
    });

    it("deve falhar ao buscar tweet com id inválido", async () => {
      const res = await request(app)
        .get(`${baseUrl}/invalid-uuid`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        'O parâmetro "id" é inválido ou ausente. Deve ser um UUID válido.'
      );
    });

    it("deve falhar ao buscar tweet inexistente", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";

      const res = await request(app)
        .get(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Tweet não encontrado.");
    });

    it("deve falhar ao buscar tweet sem token", async () => {
      const res = await request(app).get(`${baseUrl}/${tweetId}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
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
      expect(res.body.reply.parentId).toBe(tweetId);
      expect(res.body.message).toBe("Resposta criada com sucesso.");
    });

    it("deve falhar ao criar reply com parentId inválido", async () => {
      const res = await request(app)
        .post(`${baseUrl}/invalid-uuid/reply`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Resposta inválida" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        'O parâmetro "parentId" é inválido ou ausente. Deve ser um UUID válido.'
      );
    });

    it("deve falhar com parentId inexistente", async () => {
      const fakeParentId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .post(`${baseUrl}/${fakeParentId}/reply`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Reply" });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Tweet não encontrado.");
    });

    it("deve falhar ao criar reply sem token", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${tweetId}/reply`)
        .send({ content: "Reply" });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar ao criar reply com conteúdo vazio", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${tweetId}/reply`)
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "" });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O conteúdo da resposta é obrigatório.");
    });
  });

  describe("GET /api/tweets/feed - buscarFeedUsuario", () => {
    it("deve retornar o feed do usuário autenticado com tweets próprios e de seguidos", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.feed)).toBe(true);

      const autores = res.body.feed.map((t: any) => t.user.userName);
      expect(autores.some((n: string) => n.includes("tweet_"))).toBe(true);
      expect(autores.some((n: string) => n.includes("other_"))).toBe(true);
      expect(res.body.message).toBe("Feed buscado com sucesso.");
    });

    it("deve incluir replies no feed e encadeadas", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      const nestedReply = res.body.feed
        .flatMap((t: any) => t.replies || [])
        .some((r: any) => r.replies?.length > 0);
      expect(nestedReply).toBe(true);
      expect(res.body.message).toBe("Feed buscado com sucesso.");
    });

    it("deve suportar paginação com limite de 5 tweets", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed?limit=5&page=1`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);

      expect(res.body.feed.length).toBeLessThanOrEqual(5);

      expect(Array.isArray(res.body.feed)).toBe(true);
      expect(res.body.message).toBe("Feed buscado com sucesso.");
    });

    it("deve retornar feed vazio se não houver tweets", async () => {
      await limparBanco();
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.feed.length).toBe(0);
      expect(res.body.message).toBe("Feed buscado com sucesso.");
    });

    it("deve incluir replies no feed se existirem", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.feed.some((t: any) => t.replies?.length > 0)).toBe(true);
      expect(res.body.message).toBe("Feed buscado com sucesso.");
    });

    it("deve falhar com token inválido", async () => {
      const res = await request(app)
        .get(`${baseUrl}/feed`)
        .set("Authorization", "Bearer inválido");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Token inválido ou expirado.");
    });
  });
});
