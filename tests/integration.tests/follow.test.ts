import request from "supertest";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma.config";
import { randomUUID } from "crypto";

describe("FollowController - Testes de Integração", () => {
  const baseUrl = "/api/follows";
  let tokenUserA: string;
  let tokenUserB: string;
  let userAId: string;
  let userBId: string;
  let followId: string;

  beforeAll(async () => {
    await prisma.$connect();

    await prisma.like.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.tweet.deleteMany();
    await prisma.user.deleteMany();

    const userARes = await request(app)
      .post("/api/users")
      .send({
        name: "User A",
        userName: `userA_${Date.now()}`,
        email: `userA_${Date.now()}@test.com`,
        password: "123456",
      });
    userAId = userARes.body.user.id;

    const loginARes = await request(app)
      .post("/api/users/login")
      .send({ identifier: userARes.body.user.email, password: "123456" });
    tokenUserA = loginARes.body.token;

    const userBRes = await request(app)
      .post("/api/users")
      .send({
        name: "User B",
        userName: `userB_${Date.now()}`,
        email: `userB_${Date.now()}@test.com`,
        password: "123456",
      });
    userBId = userBRes.body.user.id;

    const loginBRes = await request(app)
      .post("/api/users/login")
      .send({ identifier: userBRes.body.user.email, password: "123456" });
    tokenUserB = loginBRes.body.token;
  });

  afterAll(async () => {
    await prisma.like.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.tweet.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe("POST /api/follows/:userId - seguirUsuario", () => {
    beforeEach(async () => {
      await prisma.follow.deleteMany({
        where: { followerId: userAId, followingId: userBId },
      });
    });

    it("deve permitir usuário A seguir usuário B", async () => {
      const res = await request(app)
        .post(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.follow.followerId).toBe(userAId);
      expect(res.body.follow.followingId).toBe(userBId);

      followId = res.body.follow.followerId;
    });

    it("não deve permitir seguir sem token", async () => {
      const res = await request(app).post(`${baseUrl}/${userBId}`);
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it("não deve permitir seguir usuário inexistente", async () => {
      const fakeId = randomUUID();
      const res = await request(app)
        .post(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });

    it("não deve permitir seguir o mesmo usuário duas vezes", async () => {
      await prisma.follow.create({
        data: { followerId: userAId, followingId: userBId },
      });

      const res = await request(app)
        .post(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("GET /api/follows/:userId - buscarFollow", () => {
    beforeEach(async () => {
      await prisma.follow.deleteMany({
        where: { followerId: userAId, followingId: userBId },
      });

      const follow = await prisma.follow.create({
        data: { followerId: userAId, followingId: userBId },
      });
      followId = follow.followerId;
    });

    it("deve buscar follow existente", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.follow.followerId).toBe(userAId);
      expect(res.body.follow.followingId).toBe(userBId);
    });

    it("deve retornar 404 se follow não existir", async () => {
      await prisma.follow.deleteMany({
        where: { followerId: userAId, followingId: userBId },
      });

      const res = await request(app)
        .get(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });

    it("não deve permitir buscar follow sem token", async () => {
      const res = await request(app).get(`${baseUrl}/${userBId}`);
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });
  });

  describe("DELETE /api/follows/:userId - deixarDeSeguir", () => {
    beforeEach(async () => {
      await prisma.follow.deleteMany({
        where: { followerId: userAId, followingId: userBId },
      });

      const follow = await prisma.follow.create({
        data: { followerId: userAId, followingId: userBId },
      });
      followId = follow.followerId;
    });

    it("deve permitir usuário A deixar de seguir usuário B", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it("não deve permitir deletar follow sem token", async () => {
      const res = await request(app).delete(`${baseUrl}/${userBId}`);
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it("não deve permitir deletar follow inexistente", async () => {
      await prisma.follow.deleteMany({
        where: { followerId: userAId, followingId: userBId },
      });

      const res = await request(app)
        .delete(`${baseUrl}/${userBId}`)
        .set("Authorization", `Bearer ${tokenUserA}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });
  });
});
