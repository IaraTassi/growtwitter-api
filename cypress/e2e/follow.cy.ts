import tweets from "../fixtures/tweets.json";
import users from "../fixtures/users.json";
import {
  criarUsuario,
  login,
  criarTweet,
  seguirUsuario,
  buscarFollow,
  deixarDeSeguirUsuario,
} from "../support/api";

describe("Follows E2E", () => {
  let tokenDono = "";
  let tokenOutro = "";
  let tweetId = "";
  let userIdDono = "";
  let userIdOutro = "";

  const INVALID_ID = "id_invalido";
  const NON_EXISTENT_ID = crypto.randomUUID();

  before(() => {
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
        });
    });
  });

  beforeEach(() => {
    criarTweet(tokenDono, tweets.validTweet).then((res) => {
      tweetId = res.body.tweet.id;
    });
  });

  describe("POST /api/follows - seguirUsuario", () => {
    it("Segue outro usuário com sucesso", () => {
      seguirUsuario(tokenDono, userIdOutro).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.message).to.eq("Usuário seguido com sucesso.");
      });
    });

    it("Falha ao seguir com UUID inválido", () => {
      seguirUsuario(tokenDono, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Os IDs devem ser UUIDs válidos.");
      });
    });

    it("Falha ao seguir usuário com token inválido", () => {
      seguirUsuario(NON_EXISTENT_ID, userIdOutro).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Token inválido ou expirado.");
      });
    });

    it("Falha ao seguir usuário inexistente", () => {
      seguirUsuario(tokenDono, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Usuário não encontrado.");
      });
    });

    it("Falha ao seguir a si mesmo", () => {
      seguirUsuario(tokenDono, userIdDono).then((res) => {
        expect(res.status).to.eq(409);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          "Um usuário não pode seguir a si mesmo."
        );
      });
    });

    it("Falha ao seguir um usuário já seguido", () => {
      seguirUsuario(tokenDono, userIdOutro).then(() => {
        seguirUsuario(tokenDono, userIdOutro).then((res) => {
          expect(res.status).to.eq(409);
          expect(res.body.ok).to.be.false;
          expect(res.body.message).to.eq(
            "O usuário já está seguindo este perfil."
          );
        });
      });
    });
  });

  describe("GET /api/follows - buscarFollow", () => {
    it("Busca follow com sucesso", () => {
      seguirUsuario(tokenDono, userIdOutro).then(() => {
        buscarFollow(tokenDono, userIdOutro).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
          expect(res.body.follow).to.exist;
        });
      });
    });

    it("Falha ao buscar follow com UUID inválido", () => {
      buscarFollow(tokenDono, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          'O parâmetro "userId" é inválido ou ausente. Deve ser um UUID válido.'
        );
      });
    });

    it("Falha ao buscar follow com token inválido", () => {
      buscarFollow("token_invalido", userIdDono).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Token inválido ou expirado.");
      });
    });

    it("Falha ao buscar follow de usuário inexistente", () => {
      buscarFollow(tokenDono, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Usuário não encontrado.");
      });
    });
  });

  describe("POST api/follows - deixarDeSeguirUsuario", () => {
    it("Deixa de seguir usuário com sucesso", () => {
      seguirUsuario(tokenDono, userIdOutro).then(() => {
        deixarDeSeguirUsuario(tokenDono, userIdOutro).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
          expect(res.body.message).to.eq(
            "Usuário deixado de seguir com sucesso."
          );
        });
      });
    });

    it("Falha ao deixar de seguir usuário que não está sendo seguido", () => {
      deixarDeSeguirUsuario(tokenDono, userIdOutro).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("O usuário não segue este perfil.");
      });
    });

    it("Falha ao remover follow com UUID inválido", () => {
      deixarDeSeguirUsuario(tokenDono, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          'O parâmetro "userId" é inválido ou ausente. Deve ser um UUID válido.'
        );
      });
    });

    it("Falha ao remover follow de usuário inexistente", () => {
      deixarDeSeguirUsuario(tokenDono, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Usuário não encontrado.");
      });
    });
  });
});
