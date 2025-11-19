import request from "supertest";
import { prisma } from "../../src/config/prisma.config";
import { limparBanco } from "../setup";
import app from "../../src/app";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

describe("FollowController - Testes de Integração", () => {
  const baseUrl = "/api/follows";
  let userAId: string;
  let userBId: string;
  let tokenUserA: string;
  let tokenUserB: string;

  beforeAll(async () => {
    await prisma.$connect();
    await limparBanco();

    const now = Date.now();
    const resA = await request(app)
      .post("/api/users")
      .send({
        name: "User A",
        userName: `userA_${now}`,
        email: `userA_${now}@test.com`,
        password: "123456",
      });

    userAId = resA.body.user.id;

    const loginA = await request(app).post("/api/users/login").send({
      identifier: resA.body.user.email,
      password: "123456",
    });
    tokenUserA = loginA.body.token;

    const resB = await request(app)
      .post("/api/users")
      .send({
        name: "User B",
        userName: `userB_${now}`,
        email: `userB_${now}@test.com`,
        password: "123456",
      });

    userBId = resB.body.user.id;

    const loginB = await request(app).post("/api/users/login").send({
      identifier: resB.body.user.email,
      password: "123456",
    });
    tokenUserB = loginB.body.token;
  });

  describe("POST /api/follows/:userId - seguirUsuario", () => {
    it("deve permitir usuário A seguir usuário B", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.follow.followerId).toBe(userAId);
      expect(res.body.follow.followingId).toBe(userBId);
      expect(res.body.message).toBe("Usuário seguido com sucesso.");

      const followInDb = await prisma.follow.findFirst({
        where: { followerId: userAId, followingId: userBId },
      });
      expect(followInDb).not.toBeNull();
    });

    it("deve falhar ao seguir sem token", async () => {
      const res = await request(app).post(`${baseUrl}/${userBId}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar ao seguir usuário inexistente", async () => {
      const fakeId = randomUUID();

      const res = await request(app)
        .post(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado.");
    });

    it("deve falhar seguir o mesmo usuário duas vezes", async () => {
      await prisma.follow.createMany({
        data: [{ followerId: userAId, followingId: userBId }],
        skipDuplicates: true,
      });

      const res = await request(app)
        .post(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O usuário já está seguindo este perfil.");
    });

    it("deve falhar ao tentar seguir a si mesmo", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${userAId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Um usuário não pode seguir a si mesmo.");
    });
  });

  describe("GET /api/follows/:userId - buscarFollow", () => {
    beforeEach(async () => {
      await prisma.follow.deleteMany();
    });

    it("deve buscar follow existente com sucesso", async () => {
      await prisma.follow.create({
        data: { followerId: userAId, followingId: userBId },
      });

      const res = await request(app)
        .get(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Follow buscado com sucesso.");
      expect(res.body.follow.followerId).toBe(userAId);
      expect(res.body.follow.followingId).toBe(userBId);
    });

    it("deve falhar se usuário A não segue usuário B", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Follow não encontrado.");
    });

    it("deve falhar ao buscar follow com token sem userId", async () => {
      const tokenSemId = jwt.sign({}, process.env.JWT_SECRET || "test-secret");

      const res = await request(app)
        .get(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenSemId}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado no token.");
    });

    it("deve falhar ao buscar follow de usuário inexistente", async () => {
      const fakeId = randomUUID();

      const res = await request(app)
        .get(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado.");
    });
  });

  describe("DELETE /api/follows/:userId - deixarDeSeguir", () => {
    it("deve permitir usuário A deixar de seguir usuário B", async () => {
      await prisma.follow.create({
        data: { followerId: userAId, followingId: userBId },
      });

      const res = await request(app)
        .delete(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Usuário deixado de seguir com sucesso.");

      const followInDb = await prisma.follow.findFirst({
        where: { followerId: userAId, followingId: userBId },
      });
      expect(followInDb).toBeNull();
    });

    it("deve falhar ao deletar follow inexistente", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O usuário não segue este perfil.");
    });

    it("deve falhar ao deletar sem token", async () => {
      const res = await request(app).delete(`${baseUrl}/${userBId}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar ao deletar usuário inexistente", async () => {
      const fakeId = randomUUID();

      const res = await request(app)
        .delete(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado.");
    });

    it("deve falhar ao tentar deixar de seguir a si mesmo", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${userAId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Um usuário não pode deixar de seguir a si mesmo."
      );
    });
  });
});
