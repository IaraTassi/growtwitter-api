import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma.config";
import { randomUUID } from "crypto";

describe("LikeController - Testes de Integração", () => {
  const baseUrl = "/api/likes";
  let userId: string;
  let tweetId: string;
  let token: string;

  const userData = {
    name: "Usuário Teste",
    userName: `user_${Date.now()}`,
    email: `user_${Date.now()}@test.com`,
    password: "senha123",
    imageUrl: "https://placekitten.com/200/200",
  };

  const tweetData = {
    content: "Tweet de teste",
  };

  beforeAll(async () => {
    await prisma.$connect();

    const userRes = await request(app).post("/api/users").send(userData);
    userId = userRes.body.user.id;

    const loginRes = await request(app).post("/api/users/login").send({
      identifier: userData.email,
      password: userData.password,
    });
    token = loginRes.body.token;

    const tweetRes = await prisma.tweet.create({
      data: {
        content: tweetData.content,
        userId,
      },
    });
    tweetId = tweetRes.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/likes/:tweetId - adicionarLike", () => {
    it("deve adicionar um like com sucesso", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${tweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.like).toHaveProperty("userId");
      expect(res.body.like).toHaveProperty("tweetId");
      expect(res.body.message).toBe("Like adicionado com sucesso.");
    });

    it("não deve permitir adicionar like duplicado", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${tweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("já curtiu");
    });

    it("falha ao adicionar like com tweetId inválido", async () => {
      const res = await request(app)
        .post(`${baseUrl}/invalid-uuid`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("GET /api/likes/:tweetId - buscarLike", () => {
    it("deve buscar like existente com sucesso", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${tweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.like).toHaveProperty("userId");
      expect(res.body.like).toHaveProperty("tweetId");
      expect(res.body.message).toBe("Like buscado com sucesso.");
    });

    it("retorna mensagem correta quando like não existe", async () => {
      const fakeTweetId = randomUUID();

      const res = await request(app)
        .get(`${baseUrl}/${fakeTweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.like).toBeNull();
      expect(res.body.message).toBe("Nenhum like encontrado.");
    });
  });

  describe("DELETE /api/likes/:tweetId - removerLike", () => {
    it("deve remover like com sucesso", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${tweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Like removido com sucesso.");
    });

    it("não deve remover like inexistente", async () => {
      const fakeTweetId = randomUUID();

      const res = await request(app)
        .delete(`${baseUrl}/${fakeTweetId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Like não encontrado");
    });

    it("falha ao remover like com tweetId inválido", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/invalid-uuid`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });
});
