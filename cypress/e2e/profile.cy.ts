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
} from "../support/api";

describe("Profile - E2E", () => {
  let token = "";
  let userId = "";

  let tweetId = "";
  let replyId = "";
  let likedTweetId = "";
  let otherUserToken = "";

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
      })
      .then(() => {
        const unique = Date.now();

        return criarUsuario({
          ...users.validUser2,
          email: `other_${unique}@test.com`,
          userName: `other_${unique}`,
        });
      })
      .then((res) => {
        const otherEmail = res.body.user.email;

        return login(otherEmail, users.validUser2.password);
      })
      .then((res) => {
        otherUserToken = res.body.token;

        return criarReply(otherUserToken, tweetId, {
          content: "reply other user",
        });
      });
  });

  describe("GET /api/profile/:userId/tweets - getProfileTweets", () => {
    it("deve buscar tweets do perfil", () => {
      getProfileTweets(userId, token).then((res) => {
        expect(res.status).to.eq(200);
        expect(res.body.tweets).to.be.an("array");

        const tweets = res.body.tweets as any[];

        expect(tweets.length).to.be.greaterThan(0);

        expect(tweets[0]).to.include.keys(
          "content",
          "likesCount",
          "repliesCount",
          "likedByMe",
        );
      });
    });

    it("deve retornar 404 para usuário inexistente", () => {
      getProfileTweets(NON_EXISTENT_ID, token).then((res) => {
        expect(res.status).to.eq(404);
      });
    });

    it("deve retornar vazio para usuário sem tweets", () => {
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
    it("deve retornar conversa completa (root + replies)", () => {
      getProfileReplies(userId, token).then((res) => {
        expect(res.status).to.eq(200);

        const contents = (res.body.replies as any[]).map((r: any) => r.content);

        expect(contents).to.include("tweet test");
        expect(contents).to.include("reply test");
        expect(contents).to.include("reply other user");
      });
    });

    it("deve garantir parent correto", () => {
      getProfileReplies(userId, token).then((res) => {
        const reply = (res.body.replies as any[]).find(
          (r: any) => r.content === "reply test",
        );

        expect(reply).to.exist;
        expect(reply.parent).to.exist;
        expect(reply.parent.id).to.eq(tweetId);
      });
    });

    it("deve trazer replies de outros usuários na mesma conversa", () => {
      getProfileReplies(userId, token).then((res) => {
        const contents = (res.body.replies as any[]).map((r: any) => r.content);

        expect(contents).to.include("reply other user");
      });
    });

    it("deve retornar em ordem cronológica", () => {
      getProfileReplies(userId, token).then((res) => {
        const replies = res.body.replies;

        for (let i = 1; i < replies.length; i++) {
          const prev = new Date(replies[i - 1].createdAt);
          const curr = new Date(replies[i].createdAt);

          expect(prev.getTime()).to.be.at.most(curr.getTime());
        }
      });
    });

    it("deve retornar vazio se usuário não tiver replies", () => {
      const unique = Date.now();

      criarUsuario({
        ...users.validUser1,
        email: `empty_${unique}@test.com`,
        userName: `empty_${unique}`,
      }).then((res) => {
        const newUserId = res.body.user.id;

        getProfileReplies(newUserId, token).then((res) => {
          expect(res.status).to.eq(200);
          expect(res.body.replies).to.deep.equal([]);
        });
      });
    });

    it("deve retornar 404 para usuário inexistente", () => {
      getProfileReplies(NON_EXISTENT_ID, token).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });

  describe("GET /api/profile/:userId/likes - getProfileLikes", () => {
    it("deve retornar likes do usuário", () => {
      getProfileLikes(userId, token).then((res) => {
        expect(res.status).to.eq(200);

        const likes = res.body.likes as any[];

        expect(likes).to.be.an("array");
        expect(likes.length).to.be.greaterThan(0);

        const contents = likes.map((l: any) => l.content);

        expect(contents).to.include("liked tweet");
      });
    });

    it("deve retornar likedByMe true", () => {
      getProfileLikes(userId, token).then((res) => {
        const likes = res.body.likes as any[];

        expect(likes.some((l: any) => l.likedByMe === true)).to.eq(true);
      });
    });

    it("deve retornar 404 para usuário inexistente", () => {
      getProfileLikes(NON_EXISTENT_ID, token).then((res) => {
        expect(res.status).to.eq(404);
      });
    });
  });
});
