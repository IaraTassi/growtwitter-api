import request from "supertest";
import { prisma } from "../../src/config/prisma.config";
import { limparBanco } from "../setup";
import app from "../../src/app";
import { randomUUID } from "crypto";

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

    it("deve falhar se o nome estiver vazio", async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          ...validUser,
          name: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O campo nome é obrigatório.");
    });

    it("deve falhar se o username estiver vazio", async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          ...validUser,
          userName: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O campo nome de usuário é obrigatório.");
    });

    it("deve falhar se o email for inválido", async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          ...validUser,
          email: "inválido",
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Email inválido.");
    });

    it("deve falhar se a senha estiver vazia", async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          ...validUser,
          password: "",
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "A senha é obrigatória e deve ter pelo menos 6 caracteres."
      );
    });

    it("deve falhar ao criar usuário com email duplicado", async () => {
      await request(app).post(baseUrl).send(validUser);

      const duplicateUser = {
        ...validUser,
        userName: `other_${Date.now()}`,
      };

      const res = await request(app).post(baseUrl).send(duplicateUser);

      expect(res.status).toBe(409);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O email já está em uso.");
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
      expect(res.body.message).toBe("O nome de usuário já está em uso.");
    });

    it("deve falhar se senha menor que 6 caracteres", async () => {
      const res = await request(app)
        .post(baseUrl)
        .send({
          ...validUser,
          password: "12345",
        });

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "A senha é obrigatória e deve ter pelo menos 6 caracteres."
      );
    });

    it("deve criar usuário com sucesso sem imageUrl opcional", async () => {
      const userWithoutImage = { ...validUser };
      delete userWithoutImage.imageUrl;

      const res = await request(app).post(baseUrl).send(userWithoutImage);

      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user.imageUrl).toBeNull();
    });

    it("deve falhar se imageUrl for inválido", async () => {
      const userWithInvalidImage = { ...validUser, imageUrl: "url_invalida" };

      const res = await request(app).post(baseUrl).send(userWithInvalidImage);

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("A URL da imagem é inválida.");
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

    it("deve buscar usuário por ID com token válido com sucesso", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.user.id).toBe(userId);
    });

    it("deve retornar 404 para ID inexistente válido", async () => {
      const fakeId = randomUUID();

      const res = await request(app)
        .get(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado.");
    });

    it("deve falhar ao buscar sem token", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}`)
        .set("Authorization", `${""}`);

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar ao buscar com token inválido", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}`)
        .set("Authorization", "Bearer inválido");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Token inválido ou expirado.");
    });
  });

  describe("GET /api/users - listarUsuarios", () => {
    beforeEach(async () => {
      await limparBanco();
      await request(app).post(baseUrl).send(validUser);
    });

    it("deve listar usuários com sucesso", async () => {
      const res = await request(app).get(baseUrl);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBeGreaterThan(0);
    });

    it("deve retornar array vazio se não houver usuários", async () => {
      await limparBanco();

      const res = await request(app).get(baseUrl);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);
      expect(res.body.users.length).toBe(0);
    });
  });

  describe("POST /api/users/login - login", () => {
    beforeEach(async () => {
      await limparBanco();

      const res = await request(app).post(baseUrl).send(validUser);
      userId = res.body.user.id;
    });

    it("deve logar com email com sucesso", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: validUser.email,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.id).toBe(userId);

      token = res.body.token;
    });

    it("deve logar com username com sucesso", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: validUser.userName,
        password: validUser.password,
      });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.userName).toBe(validUser.userName);
    });

    it("deve falhar com senha incorreta", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: validUser.email,
        password: "senhaerrada",
      });

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Senha incorreta.");
    });

    it("deve falhar com usuário inexistente", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({
        identifier: "usuario_inexistente",
        password: "senha123",
      });

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado.");
    });

    it("deve falhar ao logar sem dados obrigatórios", async () => {
      const res = await request(app).post(`${baseUrl}/login`).send({});

      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("O campo 'identifier' é obrigatório.");
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

    it("deve retornar ao remover ID inexistente válido", async () => {
      const fakeId = randomUUID();

      const res = await request(app)
        .delete(`${baseUrl}/${fakeId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Usuário não encontrado para remoção.");
    });

    it("deve falhar ao remover sem token", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${userToDelete}`)
        .set("Authorization", "");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe(
        "Token de autenticação não fornecido ou inválido."
      );
    });

    it("deve falhar ao remover com token inválido", async () => {
      const res = await request(app)
        .delete(`${baseUrl}/${userToDelete}`)
        .set("Authorization", "Bearer inválido");

      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
      expect(res.body.message).toBe("Token inválido ou expirado.");
    });
  });
});
