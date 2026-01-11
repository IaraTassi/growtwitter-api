import tweets from "../fixtures/tweets.json";
import users from "../fixtures/users.json";
import {
  criarUsuario,
  login,
  criarTweet,
  adicionarLike,
  buscarLike,
  removerLike,
  alternarLike,
} from "../support/api";

describe("Likes - E2E", () => {
  let tokenDono = "";
  let tokenOutro = "";
  let tweetId = "";
  let userIdDono = "";
  let userIdOutro = "";

  const INVALID_ID = "id_invalido";
  const NON_EXISTENT_ID = crypto.randomUUID();

  beforeEach(() => {
    const unique = Date.now();
    const testEmail1 = `user1_${unique}@test.com`;
    const testEmail2 = `user2_${unique}@test.com`;
    const testUserName1 = `user1_${unique}`;
    const testUserName2 = `user2_${unique}`;

    cy.task("resetTestDB").then(() => {
      criarUsuario({
        ...users.validUser1,
        email: testEmail1,
        userName: testUserName1,
      })
        .then((res) => {
          userIdDono = res.body.user.id;
          return login(testEmail1, users.validUser1.password);
        })
        .then((res) => {
          tokenDono = res.body.token;

          return criarUsuario({
            ...users.validUser2,
            email: testEmail2,
            userName: testUserName2,
          });
        })
        .then((res) => {
          userIdOutro = res.body.user.id;
          return login(testEmail2, users.validUser2.password);
        })
        .then((res) => {
          tokenOutro = res.body.token;

          return criarTweet(tokenDono, tweets.validTweet);
        })
        .then((res) => {
          tweetId = res.body.tweet.id;
        });
    });
  });

  describe("POST /api/likes/:tweetId - adicionarLike", () => {
    it("Adiciona like com sucesso", () => {
      adicionarLike(tokenOutro, tweetId).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.like).to.have.property("tweetId", tweetId);
        expect(res.body.message).to.eq("Like adicionado com sucesso.");
      });
    });

    it("Falha ao dar like com ID inválido", () => {
      adicionarLike(tokenOutro, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          "O ID do tweet deve ser um UUID válido."
        );
      });
    });

    it("Falha ao tentar curtir novamente (like duplicado)", () => {
      adicionarLike(tokenOutro, tweetId).then(() => {
        adicionarLike(tokenOutro, tweetId).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body.ok).to.be.false;
          expect(res.body.message).to.eq("Usuário já curtiu este tweet.");
        });
      });
    });

    it("Adiciona like ao curtir próprio tweet", () => {
      adicionarLike(tokenDono, tweetId).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.message).to.eq("Like adicionado com sucesso.");
      });
    });

    it("Falha ao dar like sem token", () => {
      adicionarLike("", tweetId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          "Token de autenticação não fornecido ou inválido."
        );
      });
    });

    it("Falha ao dar like em tweet inexistente", () => {
      adicionarLike(tokenOutro, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Tweet não encontrado.");
      });
    });

    it("Falha com token malformado", () => {
      adicionarLike("malformed.token.value", tweetId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });
  });

  describe("GET /api/likes/:tweetId - buscarLike", () => {
    it("Busca like com sucesso", () => {
      adicionarLike(tokenOutro, tweetId).then(() => {
        buscarLike(tokenOutro, tweetId).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
          expect(res.body.like).to.have.property("tweetId", tweetId);
        });
      });
    });

    it("Falha ao buscar like sem token", () => {
      buscarLike("", tweetId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          "Token de autenticação não fornecido ou inválido."
        );
      });
    });

    it("Falha ao dar like com ID inválido", () => {
      buscarLike(tokenOutro, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          'O parâmetro "tweetId" é inválido ou ausente. Deve ser um UUID válido.'
        );
      });
    });

    it("Falha ao buscar like de tweet inexistente", () => {
      buscarLike(tokenOutro, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Tweet não encontrado.");
      });
    });
  });

  describe("DELETE /api/likes/:tweetId - removerLike", () => {
    it("Remove like com sucesso", () => {
      adicionarLike(tokenOutro, tweetId).then(() => {
        removerLike(tokenOutro, tweetId).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
          expect(res.body.message).to.eq("Like removido com sucesso.");
        });
      });
    });

    it("Falha ao remover like inexistente", () => {
      removerLike(tokenOutro, tweetId).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Like não encontrado.");
      });
    });

    it("Falha ao remover like sem token", () => {
      removerLike("", tweetId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          "Token de autenticação não fornecido ou inválido."
        );
      });
    });

    it("Falha ao remover like com ID inválido", () => {
      removerLike(tokenOutro, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          'O parâmetro "tweetId" é inválido ou ausente. Deve ser um UUID válido.'
        );
      });
    });

    it("Falha ao remover like de tweet inexistente", () => {
      removerLike(tokenOutro, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Tweet não encontrado.");
      });
    });

    it("Falha ao remover like criado por outro usuário", () => {
      adicionarLike(tokenOutro, tweetId).then(() => {
        removerLike(tokenDono, tweetId).then((res) => {
          expect(res.status).to.eq(404);
          expect(res.body.ok).to.be.false;
          expect(res.body.message).to.eq("Like não encontrado.");
        });
      });
    });
  });

  describe("PATCH /api/likes/:tweetId - alternarLike", () => {
    it("Alterna like: adiciona se não existir", () => {
      alternarLike(tokenOutro, tweetId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.message).to.eq("Like adicionado com sucesso.");
        expect(res.body.like).to.have.property("tweetId", tweetId);
        expect(res.body.like).to.have.property("userId", userIdOutro);
      });
    });

    it("Alterna like: remove se já existir", () => {
      adicionarLike(tokenOutro, tweetId).then(() => {
        alternarLike(tokenOutro, tweetId).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
          expect(res.body.message).to.eq("Like removido com sucesso.");
          expect(res.body.like).to.be.null;
        });
      });
    });

    it("Falha ao alternar like sem token", () => {
      alternarLike("", tweetId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          "Token de autenticação não fornecido ou inválido."
        );
      });
    });

    it("Falha com token malformado", () => {
      alternarLike("malformed.token.value", tweetId).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao alternar like com ID inválido", () => {
      alternarLike(tokenOutro, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          'O parâmetro "tweetId" é inválido ou ausente. Deve ser um UUID válido.'
        );
      });
    });

    it("Falha ao alternar like de tweet inexistente", () => {
      alternarLike(tokenOutro, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Tweet não encontrado.");
      });
    });

    it("Alternar like no próprio tweet com sucesso", () => {
      alternarLike(tokenDono, tweetId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.message).to.eq("Like adicionado com sucesso.");
      });
    });
  });
});
