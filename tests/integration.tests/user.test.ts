import request from "supertest";
import { randomUUID } from "crypto";
import app from "../../src/app";
import { prisma } from "../../src/config/prisma.config";
import { limparBanco } from "../setup";

describe("UserController - Testes de Integração", () => {
  const baseUrl = "/api/users";
  let token: string;
  let validUser: any;
  let userId: string;

  beforeAll(async () => {
    await prisma.$connect();
    await limparBanco();
  });

  afterAll(async () => {
    await limparBanco();
    await prisma.$disconnect();
  });

  beforeEach(() => {
    validUser = {
      name: "Usuário Teste",
      userName: `user_${Date.now()}`,
      email: `user_${Date.now()}@test.com`,
      password: "senha123",
      imageUrl: "https://placekitten.com/200/200",
    };
  });

  describe("POST /api/users - criarUsuario", () => {
    it("deve criar um usuário com sucesso", async () => {
      const res = await request(app).post(baseUrl).send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.user).toHaveProperty("id");

      userId = res.body.user.id;
    });

    it("deve falhar ao criar usuário com dados inválidos", async () => {
      const invalidUser = {
        name: "",
        userName: "",
        email: "inválido",
        password: "",
      };
      const res = await request(app).post(baseUrl).send(invalidUser);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body).toHaveProperty("message");
    });

    it("deve falhar ao criar usuário com email duplicado", async () => {
      await request(app).post(baseUrl).send(validUser);

      const duplicateEmailUser = {
        ...validUser,
        userName: `newuser_${Date.now()}`,
      };

      const res = await request(app).post(baseUrl).send(duplicateEmailUser);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("email");
    });

    it("deve falhar ao criar usuário com username duplicado", async () => {
      await request(app).post(baseUrl).send(validUser);

      const duplicateUser = {
        ...validUser,
        email: `other_${Date.now()}@test.com`,
      };

      const res = await request(app).post(baseUrl).send(duplicateUser);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("usuário");
    });
  });

  describe("POST /api/users/login - login", () => {
    beforeEach(async () => {
      const res = await request(app).post(baseUrl).send(validUser);
      userId = res.body.user.id;
    });

    it("deve logar com email", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();

      token = res.body.token;
    });

    it("deve logar com username", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: validUser.userName,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it("falha com senha incorreta", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: validUser.email,
        password: "senhaerrada",
      });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Senha");
    });

    it("falha com username inexistente", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: "usuario_inexistente",
        password: "senha123",
      });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Usuário não encontrado");
    });
  });

  describe("GET /api/users/:userId - buscarPorId", () => {
    beforeEach(async () => {
      const res = await request(app).post(baseUrl).send(validUser);
      userId = res.body.user.id;

      const loginRes = await request(app).post(`${baseUrl}/login`).send({
        identifier: validUser.email,
        password: validUser.password,
      });
      token = loginRes.body.token;
    });

    it("deve buscar usuário por ID com token válido", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.user.id).toBe(userId);
    });

    it("retorna 404 para ID inexistente válido", async () => {
      const fakeId = randomUUID();

      const res = await request(app)
        .get(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Usuário não encontrado");
    });
  });

  describe("GET /api/users - listarUsuarios", () => {
    beforeEach(async () => {
      await request(app).post(baseUrl).send(validUser);
    });

    it("deve listar usuários com sucesso", async () => {
      const res = await request(app).get(baseUrl);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
    });
  });

  describe("DELETE /api/users/:userId - removerUsuario", () => {
    let userToDelete: string;

    beforeEach(async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          name: "Usuário Remover",
          userName: `delete_${Date.now()}`,
          email: `delete_${Date.now()}@test.com`,
          password: "senha123",
          imageUrl: "https://placekitten.com/200/200",
        });

      userToDelete = res.body.user.id;

      const loginRes = await request(app).post(`${baseUrl}/login`).send({
        identifier: res.body.user.email,
        password: "senha123",
      });

      token = loginRes.body.token;
    });

    it("deve remover usuário com sucesso", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${userToDelete}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.message).toBe("Usuário removido com sucesso.");
    });

    it("retorna 404 ao remover ID inexistente válido", async () => {
      const fakeId = randomUUID();

      const res = await request(app)
        .delete(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toContain("Usuário não encontrado");
    });
  });
});
