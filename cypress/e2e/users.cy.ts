import users from "../fixtures/users.json";
import {
  criarUsuario,
  registrar,
  login,
  listarUsuarios,
  buscarPorIdUsuario,
  removerUsuario,
  criarTweet,
  criarReply,
} from "../support/api";

describe("Usuários - E2E", () => {
  let token = "";
  let userId = "";
  let currentUser: any;

  const NON_EXISTENT_ID = crypto.randomUUID();

  const buildUser = () => {
    const password = "123456";

    return {
      ...users.validUser1,
      email: `user_${crypto.randomUUID()}@teste.com`,
      userName: `user_${crypto.randomUUID()}`,
      password,
    };
  };

  before(() => {
    currentUser = buildUser();

    return criarUsuario(currentUser)
      .then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;

        userId = res.body.user.id;
      })
      .then(() => login(currentUser.email, currentUser.password))
      .then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;

        token = res.body.token;
      });
  });

  describe("POST /api/users - criarUsuario", () => {
    it("Cria usuário com sucesso", () => {
      const user = buildUser();

      return criarUsuario(user).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.have.property("id");
        expect(res.body.user).to.not.have.property("password");
      });
    });

    it("Falha ao criar usuário com email duplicado", () => {
      const baseUser = buildUser();

      return criarUsuario(baseUser)
        .then(() =>
          criarUsuario({
            ...buildUser(),
            email: baseUser.email,
            userName: `unique_${crypto.randomUUID()}`,
          }),
        )
        .then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body.ok).to.be.false;
          expect(res.body.message).to.eq("O email já está em uso.");
        });
    });

    it("Falha ao criar usuário com dados inválidos", () => {
      return criarUsuario(users.invalidUser).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Não deve retornar a senha ao registrar usuário", () => {
      const user = buildUser();

      return criarUsuario(user).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.not.have.property("password");
        expect(res.body.user.email).to.eq(user.email);
      });
    });
  });

  describe("POST /api/users - registrar", () => {
    it("Não deve retornar a senha ao registrar usuário", () => {
      const user = buildUser();

      return criarUsuario(user).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.not.have.property("password");
        expect(res.body.user.email).to.eq(user.email);
      });
    });

    it("Falha ao registrar usuário com senha menor que 6 caracteres", () => {
      const weakPasswordUser = {
        ...users.validUser2,
        email: `weak_${crypto.randomUUID()}@teste.com`,
        userName: `weak_${crypto.randomUUID()}`,
        password: "123",
      };

      registrar(weakPasswordUser).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          "A senha é obrigatória e deve ter pelo menos 6 caracteres.",
        );
      });
    });

    it("Falha ao registrar usuário com URL de imagem inválida", () => {
      const invalidImageUser = {
        ...users.validUser2,
        email: `img_${crypto.randomUUID()}@teste.com`,
        userName: `img_${crypto.randomUUID()}`,
        imageUrl: "ftp://invalid.url/imagem.png",
      };

      registrar(invalidImageUser).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("A URL da imagem é inválida.");
      });
    });

    it("Registra usuário com senha exatamente 6 caracteres", () => {
      const exactPasswordUser = {
        ...users.validUser2,
        email: `exact_${crypto.randomUUID()}@teste.com`,
        userName: `exact_${crypto.randomUUID()}`,
        password: "123456",
      };

      registrar(exactPasswordUser).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.not.have.property("password");
      });
    });

    it("Registra usuário sem URL de imagem (opcional)", () => {
      const noImageUser = {
        ...users.validUser2,
        email: `noimg_${crypto.randomUUID()}@teste.com`,
        userName: `noimg_${crypto.randomUUID()}`,
        imageUrl: undefined,
      };

      registrar(noImageUser).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.not.have.property("password");
        expect(res.body.user.imageUrl == null).to.be.true;
        1;
      });
    });

    it("Registra usuário com senha longa (limite alto, 100 caracteres)", () => {
      const longPassword = "A".repeat(100);
      const longPasswordUser = {
        ...users.validUser2,
        email: `longpass_${crypto.randomUUID()}@teste.com`,
        userName: `longpass_${crypto.randomUUID()}`,
        password: longPassword,
      };

      registrar(longPasswordUser).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.not.have.property("password");
      });
    });
  });

  describe("POST /api/users/login - login", () => {
    it("Faz login do usuário com sucesso", () => {
      return login(currentUser.email, currentUser.password).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.token).to.be.a("string");
      });
    });

    it("Falha ao logar com senha incorreta", () => {
      return login(currentUser.email, "senhaerrada").then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Não deve retornar a senha no corpo da resposta ao fazer login", () => {
      return login(currentUser.email, currentUser.password).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.not.have.property("password");
      });
    });
  });

  describe("GET /api/users - listarUsuarios", () => {
    it("Lista usuários com sucesso", () => {
      return listarUsuarios().then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.users).to.be.an("array");
        expect(res.body.users.length).to.be.greaterThan(0);
      });
    });

    it("Não deve expor a senha na listagem de usuários", () => {
      return listarUsuarios().then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;

        res.body.users.forEach((user: any) => {
          expect(user).to.not.have.property("password");
        });
      });
    });
  });

  describe("GET /api/users/:userId - buscarPorId", () => {
    it("Busca usuário por ID com sucesso", () => {
      return buscarPorIdUsuario(token, userId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.user.id).to.eq(userId);
      });
    });

    it("Falha ao buscar usuário com ID inválido", () => {
      return buscarPorIdUsuario(token, "id_invalido").then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao buscar usuário inexistente", () => {
      return buscarPorIdUsuario(token, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao buscar sem token de autenticação", () => {
      return buscarPorIdUsuario("", userId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao buscar com token inválido", () => {
      return buscarPorIdUsuario("Bearer invalid", userId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao buscar usuário com token expirado", () => {
      return buscarPorIdUsuario("token_expirad", userId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Token inválido ou expirado.");
      });
    });

    it("Não deve expor a senha ao buscar usuário por ID", () => {
      return buscarPorIdUsuario(token, userId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.user).to.not.have.property("password");
      });
    });

    it("Deve retornar contadores no usuário", () => {
      return buscarPorIdUsuario(token, userId).then((res) => {
        expect(res.body.user).to.have.property("tweetsCount");
        expect(res.body.user).to.have.property("followersCount");
        expect(res.body.user).to.have.property("followingCount");
      });
    });

    it("Deve contar apenas tweets pai", () => {
      return criarTweet(token, { content: "tweet pai" })
        .then((res) => {
          const parentId = res.body.tweet.id;

          return criarReply(token, parentId, {
            content: "reply",
          });
        })
        .then(() => buscarPorIdUsuario(token, userId))
        .then((res) => {
          expect(res.body.user.tweetsCount).to.eq(1);
        });
    });
  });

  describe("DELETE /api/users/:userId - removerUsuario", () => {
    it("Remove usuário com sucesso", () => {
      const user = buildUser();

      let tempToken = "";
      let tempId = "";

      return criarUsuario(user)
        .then((res) => {
          tempId = res.body.user.id;
        })
        .then(() => login(user.email, user.password))
        .then((res) => {
          tempToken = res.body.token;
        })
        .then(() => removerUsuario(tempToken, tempId))
        .then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
        });
    });

    it("Falha ao deletar usuário com Id inválido", () => {
      return removerUsuario(token, "id_invalido").then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao deletar usuário inexistente", () => {
      return removerUsuario(token, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao deletar sem token", () => {
      return removerUsuario("", userId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao deletar com token inválido", () => {
      return removerUsuario("token_fake", userId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });
  });
});
