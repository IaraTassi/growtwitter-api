import users from "../fixtures/users.json";
import {
  adicionarLike,
  getProfileLikes,
  getProfileReplies,
  getProfileTweets,
  criarReply,
  criarTweet,
  criarUsuario,
  login,
  registrar,
} from "../support/api";

describe("Profile - E2E", () => {
  let token = "";
  let userId = "";

  let tweetId = "";
  let replyId = "";
  let likedTweetId = "";

  const NON_EXISTENT_ID = crypto.randomUUID();

  before(() => {
    const unique = Date.now();
    const email = `profile_${unique}@test.com`;
    const userName = `profile_${unique}`;

    return cy
      .task("resetTestDB")
      .then(() => {
        return criarUsuario({
          ...users.validUser1,
          email,
          userName,
        });
      })
      .then((res) => {
        userId = res.body.user.id;

        return login(email, users.validUser1.password);
      })
      .then((res) => {
        token = res.body.token;

        return criarTweet(token, { content: "tweet test" });
      })
      .then((res) => {
        tweetId = res.body.tweet.id;

        return criarReply(token, tweetId, {
          content: "reply test",
        });
      })
      .then((res) => {
        replyId = res.body.reply?.id || res.body.tweet?.id || res.body.id;

        return criarTweet(token, { content: "liked tweet" });
      })
      .then((res) => {
        likedTweetId = res.body.tweet.id;

        return adicionarLike(token, likedTweetId);
      });
  });

  describe("GET /api/profile/:userId/tweets - getProfileTweets", () => {
    it("deve buscar tweets do perfil com sucesso", () => {
      getProfileTweets(userId, token).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.tweets).to.be.an("array");
        expect(res.body.tweets.length).to.be.greaterThan(0);

        expect(res.body.tweets[0]).to.have.property("content");
        expect(res.body.tweets[0]).to.have.property("likesCount");
        expect(res.body.tweets[0]).to.have.property("repliesCount");
        expect(res.body.tweets[0]).to.have.property("likedByMe");
      });
    });

    it("deve retornar 404 para usuário inexistente", () => {
      getProfileTweets(NON_EXISTENT_ID, token).then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    it("deve retornar array vazio para usuário sem tweets", () => {
      criarUsuario({
        ...users.validUser2,
        email: `empty_${Date.now()}@test.com`,
        userName: `empty_${Date.now()}`,
      }).then((res) => {
        const emptyId = res.body.user.id;

        getProfileTweets(emptyId, token).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.tweets).to.deep.eq([]);
        });
      });
    });
  });

  describe("GET /api/profile/:userId/replies - getProfileReplies", () => {
    it("deve buscar replies do perfil com sucesso", () => {
      getProfileReplies(userId, token).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.replies).to.be.an("array");
        expect(res.body.replies.length).to.be.greaterThan(0);

        expect(res.body.replies[0]).to.have.property("content", "reply test");
        expect(res.body.replies[0]).to.have.property("parent");
      });
    });

    it("deve garantir que reply tem parent válido", () => {
      getProfileReplies(userId, token).then((res) => {
        const reply = res.body.replies[0];

        expect(reply.parent).to.exist;
        expect(reply.parent.id).to.eq(tweetId);
      });
    });

    it("deve retornar 404 para usuário inexistente", () => {
      getProfileReplies(NON_EXISTENT_ID, token).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });

  describe("GET /api/profile/:userId/likes - getProfileLikes", () => {
    it("deve buscar likes do perfil com sucesso", () => {
      getProfileLikes(userId, token).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.likes).to.be.an("array");
        expect(res.body.likes.length).to.be.greaterThan(0);

        expect(res.body.likes[0]).to.have.property("content", "liked tweet");
        expect(res.body.likes[0]).to.have.property("likedByMe", true);
      });
    });

    it("deve retornar likedByMe como boolean", () => {
      getProfileLikes(userId, token).then((res) => {
        expect(res.body.likes[0].likedByMe).to.be.a("boolean");
      });
    });

    it("deve retornar 404 para usuário inexistente", () => {
      getProfileLikes(NON_EXISTENT_ID, token).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });
});
