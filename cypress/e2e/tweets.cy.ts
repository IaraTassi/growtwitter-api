import tweets from "../fixtures/tweets.json";
import users from "../fixtures/users.json";
import {
  criarTweet,
  criarReply,
  buscarPorIdTweet,
  buscarFeedUsuario,
  buscarReplies,
  criarUsuario,
  login,
} from "../support/api";

describe("Tweets - E2E", () => {
  let replyId = "";
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
          return criarTweet(tokenDono, tweets.validTweet);
        })
        .then((res) => {
          tweetId = res.body.tweet.id;
        });
    });
  });

  describe("POST /api/tweets - criarTweet", () => {
    it("Cria tweet com sucesso", () => {
      criarTweet(tokenDono, tweets.validTweet).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.tweet).to.have.property("id");
        tweetId = res.body.tweet.id;
      });
    });

    it("Falha ao criar tweet sem token", () => {
      criarTweet("", tweets.validTweet).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao criar tweet vazio", () => {
      criarTweet(tokenDono, tweets.emptyTweet).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao criar tweet inválido", () => {
      criarTweet(tokenDono, tweets.invalidTweet).then((res) => {
        expect(res.status).to.eq(400);
      });
    });

    it("Cria replies encadeadas (3 níveis) com sucesso", () => {
      criarReply(tokenOutro, tweetId, { content: "reply nível 1" }).then(
        (res1) => {
          expect(res1.status).to.eq(201);
          const reply1Id = res1.body.reply.id;

          criarReply(tokenDono, reply1Id, { content: "reply nível 2" }).then(
            (res2) => {
              expect(res2.status).to.eq(201);
              const reply2Id = res2.body.reply.id;

              criarReply(tokenOutro, reply2Id, {
                content: "reply nível 3",
              }).then((res3) => {
                expect(res3.status).to.eq(201);
                const reply3 = res3.body.reply;
                expect(reply3.parentId).to.eq(reply2Id);

                buscarPorIdTweet(tokenDono, reply3.id).then((r3) => {
                  expect(r3.status).to.eq(200);
                  expect(r3.body.tweet.parentId).to.eq(reply2Id);
                });

                buscarPorIdTweet(tokenDono, reply2Id).then((r2) => {
                  expect(r2.status).to.eq(200);
                  expect(r2.body.tweet.parentId).to.eq(reply1Id);
                });
              });
            }
          );
        }
      );
    });
  });

  describe("POST /api/tweets/:tweetId/reply - criarReply", () => {
    it("Cria reply com sucesso em tweet de outro usuário", () => {
      criarTweet(tokenOutro, tweets.validTweet).then((resTweetOutro) => {
        const tweetOutroId = resTweetOutro.body.tweet.id;

        criarReply(tokenDono, tweetOutroId, tweets.validReply).then((res) => {
          expect(res.status).to.eq(201);
          expect(res.body.ok).to.be.true;
          expect(res.body.reply).to.have.property("id");
          expect(res.body.reply.parentId).to.eq(tweetOutroId);

          replyId = res.body.reply.id;
        });
      });
    });

    it("Cria reply com sucesso em tweet próprio", () => {
      criarReply(tokenDono, tweetId, tweets.validReply).then((res) => {
        expect(res.status).to.eq(201);
        expect(res.body.ok).to.be.true;
        expect(res.body.reply.parentId).to.eq(tweetId);
        expect(res.body.reply.userId).to.eq(userIdDono);
        expect(res.body.message).to.eq("Resposta criada com sucesso.");
      });
    });

    it("Falha ao criar reply inválido", () => {
      criarReply(tokenDono, tweetId, tweets.invalidReply).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.eq("O conteúdo da resposta é obrigatório.");
      });
    });

    it("Falha ao criar reply em tweet inexistente", () => {
      criarReply(tokenDono, NON_EXISTENT_ID, tweets.validReply).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao criar reply com ID inválido", () => {
      criarReply(tokenDono, INVALID_ID, tweets.validReply).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
      });
    });

    describe("GET /api/tweets/:id - buscarPorId", () => {
      it("Busca tweet sem token com sucesso (agora público)", () => {
        buscarPorIdTweet("", tweetId).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
          expect(res.body.tweet).to.have.property("id", tweetId);
        });
      });
    });
  });

  describe("GET /api/tweets/:id - buscarPorId", () => {
    it("Busca tweet com sucesso", () => {
      buscarPorIdTweet(tokenDono, tweetId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.tweet).to.have.property("id", tweetId);
      });
    });

    it("Falha ao buscar tweet com ID inválido", () => {
      buscarPorIdTweet(tokenDono, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Falha ao buscar tweet inexistente", () => {
      buscarPorIdTweet(tokenDono, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
      });
    });

    it("Busca tweet sem token (agora público) - sucesso", () => {
      buscarPorIdTweet("", tweetId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.tweet).to.have.property("id", tweetId);
      });
    });
  });

  describe("GET /api/tweets/feed - buscarFeedUsuario", () => {
    it("Retorna feed com sucesso", () => {
      buscarFeedUsuario(tokenDono).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.feed).to.be.an("array");
      });
    });

    it("Falha ao acessar feed sem token", () => {
      buscarFeedUsuario("").then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });
  });

  describe("Paginação de Feed - E2E", () => {
    it("Retorna feed paginado com sucesso (page=1, limit=5)", () => {
      buscarFeedUsuario(tokenDono, 1, 5).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;

        expect(res.body.feed).to.be.an("array");
        expect(res.body.feed.length).to.be.lte(5);
      });
    });

    it("Retorna diferentes resultados para páginas diferentes", () => {
      buscarFeedUsuario(tokenDono, 1, 3).then((res1) => {
        expect(res1.status).to.eq(200);

        const primeiraPagina = res1.body.feed;
        if (primeiraPagina.length < 3) {
          cy.log(
            "Feed não possui itens suficientes para criar duas páginas reais."
          );
          return;
        }

        buscarFeedUsuario(tokenDono, 2, 3).then((res2) => {
          expect(res2.status).to.eq(200);

          const segundaPagina = res2.body.feed;

          expect(segundaPagina).to.not.deep.equal(primeiraPagina);
        });
      });
    });

    it("Falha ao acessar paginação do feed sem token", () => {
      buscarFeedUsuario("", 1, 5).then((res) => {
        expect(res.status).to.eq(401);
        expect(res.body.ok).to.be.false;
      });
    });
  });

  describe("GET /api/tweets/:tweetId/replies - buscarReplies", () => {
    it("Retorna todas as replies de um tweet com sucesso", () => {
      criarTweet(tokenDono, { content: "Reply 1", parentId: tweetId });
      criarTweet(tokenDono, { content: "Reply 2", parentId: tweetId });

      buscarReplies(tokenDono, tweetId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.replies).to.be.an("array");
        expect(res.body.replies.some((r: any) => r.parentId === tweetId)).to.be
          .true;
        expect(res.body.totalCount).to.be.a("number");
      });
    });

    it("Retorna array vazio e totalCount 0 se não houver replies", () => {
      criarTweet(tokenDono, {
        content: "Tweet sem replies para teste",
      }).then((resTweet) => {
        const tweetSemRepliesId = resTweet.body.tweet.id;

        buscarReplies("", tweetSemRepliesId).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.ok).to.be.true;
          expect(res.body.replies).to.be.an("array");
          expect(res.body.replies.length).to.eq(0);
          expect(res.body.totalCount).to.eq(0);
        });
      });
    });

    it("Falha ao buscar replies com ID inválido", () => {
      buscarReplies(tokenDono, INVALID_ID).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq(
          'O parâmetro "tweetId" é inválido ou ausente. Deve ser um UUID válido.'
        );
      });
    });

    it("Falha ao buscar replies de tweet inexistente", () => {
      buscarReplies(tokenDono, NON_EXISTENT_ID).then((res) => {
        expect(res.status).to.eq(404);
        expect(res.body.ok).to.be.false;
        expect(res.body.message).to.eq("Tweet não encontrado.");
      });
    });

    it("Busca replies sem token com sucesso (agora público)", () => {
      buscarReplies("", tweetId).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.replies).to.be.an("array");
        expect(res.body.totalCount).to.be.a("number");
      });
    });

    it("Permite paginação com page e limit (equivalente a skip/take)", () => {
      for (let i = 0; i < 5; i++) {
        criarTweet(tokenDono, {
          content: `Paginação ${i}`,
          parentId: tweetId,
        });
      }

      buscarReplies(tokenDono, tweetId, 2, 2).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.ok).to.be.true;
        expect(res.body.replies).to.be.an("array");
        expect(res.body.replies.length).to.be.lte(2);
        expect(res.body.totalCount).to.be.a("number");
      });
    });
  });
});
