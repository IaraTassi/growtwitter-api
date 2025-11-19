import request from "supertest";
import { prisma } from "../../src/config/prisma.config";
import { limparBanco } from "../setup";
import app from "../../src/app";
import jwt from "jsonwebtoken";

describe("LikeController - Testes de Integração", () => {
  const baseUrl = "/api/likes";

  let idUsuarioDono: string;
  let idUsuarioOutro: string;
  let idTweet: string;
  let tokenUsuarioDono: string;
  let tokenUsuarioOutro: string;

  const dadosUsuarioDono = {
    name: "Usuário Dono",
    userName: `usuarioDono_${Date.now()}`,
    email: `usuarioDono_${Date.now()}@test.com`,
    password: "senha123",
    imageUrl: "https://placekitten.com/200/200",
  };

  const dadosUsuarioOutro = {
    name: "Outro Usuário",
    userName: `usuarioOutro_${Date.now()}`,
    email: `usuarioOutro_${Date.now()}@test.com`,
    password: "senha123",
    imageUrl: "https://placekitten.com/200/200",
  };

  const dadosTweet = { content: "Tweet de teste" };

  beforeEach(async () => {
    await prisma.$connect();
    await limparBanco();

    const resDono = await request(app)
      .post("/api/users")
      .send(dadosUsuarioDono);
    idUsuarioDono = resDono.body.user.id;
    const loginDono = await request(app).post("/api/users/login").send({
      identifier: dadosUsuarioDono.email,
      password: dadosUsuarioDono.password,
    });
    tokenUsuarioDono = loginDono.body.token;

    const resOutro = await request(app)
      .post("/api/users")
      .send(dadosUsuarioOutro);
    idUsuarioOutro = resOutro.body.user.id;
    const loginOutro = await request(app).post("/api/users/login").send({
      identifier: dadosUsuarioOutro.email,
      password: dadosUsuarioOutro.password,
    });
    tokenUsuarioOutro = loginOutro.body.token;

    const resTweet = await prisma.tweet.create({
      data: { content: dadosTweet.content, userId: idUsuarioDono },
    });
    idTweet = resTweet.id;
  });

  afterAll(async () => {
    await limparBanco();
    await prisma.$disconnect();
  });

  describe("POST /api/likes/:tweetId - adicionarLike", () => {
    it("deve adicionar like com sucesso", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.like).toHaveProperty("userId", idUsuarioOutro);
      expect(res.body.like).toHaveProperty("tweetId", idTweet);
      expect(res.body.message).toBe("Like adicionado com sucesso.");
    });

    it("deve falhar se like duplicado", async () => {
      await prisma.like.createMany({
        data: [{ userId: idUsuarioOutro, tweetId: idTweet }],
        skipDuplicates: true,
      });

      const res = await request(app)
        .post(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário já curtiu este tweet.");
    });

    it("deve falhar quando tweetId inválido", async () => {
      const res = await request(app)
        .post(`${baseUrl}/invalid-uuid`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O ID do tweet deve ser um UUID válido.");
    });

    it("deve falhar quando token não informado", async () => {
      const res = await request(app).post(`${baseUrl}/${idTweet}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar ao curtir próprio tweet", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenUsuarioDono}`);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não pode curtir o próprio tweet.");
    });
  });

  describe("GET /api/likes/:tweetId - buscarLike", () => {
    it("deve buscar like existente", async () => {
      await prisma.like.createMany({
        data: [{ userId: idUsuarioOutro, tweetId: idTweet }],
        skipDuplicates: true,
      });

      const res = await request(app)
        .get(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.like.userId).toBe(idUsuarioOutro);
      expect(res.body.like.tweetId).toBe(idTweet);
      expect(res.body.message).toBe("Like buscado com sucesso.");
    });

    it("deve retornar null quando like não existe", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.like).toBeNull();
      expect(res.body.message).toBe("Nenhum like encontrado.");
    });

    it("deve falhar quando tweetId inválido", async () => {
      const res = await request(app)
        .get(`${baseUrl}/invalid-uuid`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        'O parâmetro "tweetId" é inválido ou ausente. Deve ser um UUID válido.'
      );
    });

    it("deve falhar quando token não informado", async () => {
      const res = await request(app).get(`${baseUrl}/${idTweet}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });
  });

  describe("DELETE /api/likes/:tweetId - removerLike", () => {
    it("deve remover like com sucesso", async () => {
      await prisma.like.createMany({
        data: [{ userId: idUsuarioOutro, tweetId: idTweet }],
        skipDuplicates: true,
      });

      const res = await request(app)
        .delete(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Like removido com sucesso.");
    });

    it("deve falhar ao remover like inexistente", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Like não encontrado.");
    });

    it("deve falhar quando tweetId inválido", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/invalid-uuid`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        'O parâmetro "tweetId" é inválido ou ausente. Deve ser um UUID válido.'
      );
    });

    it("deve falhar quando tweetId válido mas tweet não existir", async () => {
      const fakeId = "00000000-0000-0000-0000-000000000000";
      const res = await request(app)
        .delete(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${tokenUsuarioOutro}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Tweet não encontrado.");
    });

    it("deve falhar quando token não informado", async () => {
      const res = await request(app).delete(`${baseUrl}/${idTweet}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar quando userId está ausente no token", async () => {
      const tokenSemUserId = jwt.sign(
        {},
        process.env.JWT_SECRET || "test-secret"
      );

      const res = await request(app)
        .delete(`${baseUrl}/${idTweet}`)
        .set("Authorization", `Bearer ${tokenSemUserId}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado no token.");
    });
  });
});
