import request from "supertest";
import { prisma } from "../../src/config/prisma.config";
import app from "../../src/app";
import { limparBanco } from "../setup";

describe("ProfileController - Testes de Integração", () => {
  const baseUrl = "/api/profile";
  let token: string;
  let userId: string;
  let otherUserId: string;
  let tweetId: string;
  let replyId: string;
  let likedTweetId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await limparBanco();

    const resUser = await request(app)
      .post("/api/users")
      .send({
        name: "Profile User",
        userName: `profile_${Date.now()}`,
        email: `profile_${Date.now()}@test.com`,
        password: "123456",
      });

    userId = resUser.body.user.id;

    const loginRes = await request(app).post("/api/users/login").send({
      identifier: resUser.body.user.email,
      password: "123456",
    });

    token = loginRes.body.token;

    const resOther = await request(app)
      .post("/api/users")
      .send({
        name: "Other User",
        userName: `other_${Date.now()}`,
        email: `other_${Date.now()}@test.com`,
        password: "123456",
      });

    otherUserId = resOther.body.user.id;

    const tweet = await prisma.tweet.create({
      data: {
        content: "tweet test",
        userId,
      },
    });

    tweetId = tweet.id;

    const reply = await prisma.tweet.create({
      data: {
        content: "reply test",
        userId,
        parentId: tweetId,
      },
    });

    replyId = reply.id;

    const likedTweet = await prisma.tweet.create({
      data: {
        content: "liked tweet",
        userId: otherUserId,
      },
    });

    likedTweetId = likedTweet.id;

    await prisma.like.create({
      data: {
        userId,
        tweetId: likedTweetId,
      },
    });
  });

  describe("GET /profile/:userId/tweets - getProfileTweets", () => {
    it("deve buscar tweets do usuário com sucesso", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/tweets`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.tweets)).toBe(true);
      expect(res.body.tweets.length).toBeGreaterThan(0);

      expect(res.body.tweets[0]).toMatchObject({
        content: "tweet test",
        likesCount: expect.any(Number),
        repliesCount: expect.any(Number),
        likedByMe: expect.any(Boolean),
      });
    });

    it("deve retornar array vazio para usuário sem tweets", async () => {
      const emptyUser = await request(app)
        .post("/api/users")
        .send({
          name: "Empty",
          userName: `empty_${Date.now()}`,
          email: `empty_${Date.now()}@test.com`,
          password: "123456",
        });

      const resLogin = await request(app).post("/api/users/login").send({
        identifier: emptyUser.body.user.email,
        password: "123456",
      });

      const res = await request(app)
        .get(`${baseUrl}/${emptyUser.body.user.id}/tweets`)
        .set("Authorization", `Bearer ${resLogin.body.token}`);

      expect(res.status).toBe(200);
      expect(res.body.tweets).toEqual([]);
    });

    it("deve retornar 404 para usuário inexistente", async () => {
      const res = await request(app)
        .get(`${baseUrl}/00000000-0000-0000-0000-000000000000/tweets`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(404);
    });

    it("deve manter estrutura do DTO consistente", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/tweets`)
        .set("Authorization", `Bearer ${token}`);

      const t = res.body.tweets[0];

      expect(t).toHaveProperty("id");
      expect(t).toHaveProperty("content");
      expect(t).toHaveProperty("createdAt");
      expect(t).toHaveProperty("user");
      expect(t).toHaveProperty("likesCount");
      expect(t).toHaveProperty("repliesCount");
      expect(t).toHaveProperty("likedByMe");
    });

    it("deve retornar tweets ordenados por data desc", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/tweets`)
        .set("Authorization", `Bearer ${token}`);

      const tweets = res.body.tweets;

      for (let i = 1; i < tweets.length; i++) {
        expect(
          new Date(tweets[i - 1].createdAt).getTime(),
        ).toBeGreaterThanOrEqual(new Date(tweets[i].createdAt).getTime());
      }
    });
  });

  describe("GET /api/profile/:userId/replies - getProfileReplies", () => {
    it("deve retornar conversa em formato de árvore", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/replies`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      const root = res.body.replies.find((t: any) => t.id === tweetId);

      expect(root).toBeDefined();
      expect(root.content).toBe("tweet test");

      const reply = root.replies.find((r: any) => r.id === replyId);

      expect(reply).toBeDefined();
      expect(reply.content).toBe("reply test");
    });

    it("deve manter estrutura hierárquica correta", async () => {
      const replyLevel2 = await prisma.tweet.create({
        data: {
          content: "reply level 2",
          userId,
          parentId: replyId,
        },
      });

      const res = await request(app)
        .get(`${baseUrl}/${userId}/replies`)
        .set("Authorization", `Bearer ${token}`);

      const root = res.body.replies.find((t: any) => t.id === tweetId);
      const level1 = root.replies.find((r: any) => r.id === replyId);
      const level2 = level1.replies.find((r: any) => r.id === replyLevel2.id);

      expect(level2).toBeDefined();
      expect(level2.content).toBe("reply level 2");
    });

    it("deve ordenar replies cronologicamente dentro da árvore", async () => {
      function isSortedAsc(replies: any[]): boolean {
        for (let i = 1; i < replies.length; i++) {
          const prev = new Date(replies[i - 1].createdAt).getTime();
          const curr = new Date(replies[i].createdAt).getTime();

          if (prev > curr) return false;

          if (!isSortedAsc(replies[i].replies)) return false;
        }
        return true;
      }

      const res = await request(app)
        .get(`${baseUrl}/${userId}/replies`)
        .set("Authorization", `Bearer ${token}`);

      res.body.replies.forEach((thread: any) => {
        expect(isSortedAsc(thread.replies)).toBe(true);
      });
    });

    it("deve trazer respostas de outros usuários na mesma conversa", async () => {
      await prisma.tweet.create({
        data: {
          content: "reply other user",
          userId: otherUserId,
          parentId: tweetId,
        },
      });

      const res = await request(app)
        .get(`${baseUrl}/${userId}/replies`)
        .set("Authorization", `Bearer ${token}`);

      const root = res.body.replies.find((t: any) => t.id === tweetId);

      const contents = root.replies.map((r: any) => r.content);

      expect(contents).toContain("reply other user");
    });

    it("deve retornar vazio se usuário não tiver replies", async () => {
      const resNewUser = await request(app)
        .post("/api/users")
        .send({
          name: "No Replies",
          userName: `no_${Date.now()}`,
          email: `no_${Date.now()}@test.com`,
          password: "123456",
        });

      const newUserId = resNewUser.body.user.id;

      const res = await request(app)
        .get(`${baseUrl}/${newUserId}/replies`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.replies).toEqual([]);
    });
  });

  describe("GET /api/profile/:userId/likes - getProfileLikes", () => {
    it("deve buscar tweets curtidos com sucesso", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/likes`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.likes)).toBe(true);
      expect(res.body.likes.length).toBeGreaterThan(0);

      expect(res.body.likes[0]).toMatchObject({
        content: "liked tweet",
        likedByMe: true,
      });
    });

    it("deve retornar tweets curtidos com likedByMe true", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/likes`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);

      expect(res.body.likes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            content: "liked tweet",
            likedByMe: true,
          }),
        ]),
      );
    });

    it("deve retornar likes de tweets e replies", async () => {
      const replyLiked = await prisma.tweet.create({
        data: {
          content: "reply liked",
          userId: otherUserId,
          parentId: tweetId,
        },
      });

      await prisma.like.create({
        data: {
          userId,
          tweetId: replyLiked.id,
        },
      });

      const res = await request(app)
        .get(`${baseUrl}/${userId}/likes`)
        .set("Authorization", `Bearer ${token}`);

      const contents = res.body.likes.map((l: any) => l.content);

      expect(contents).toContain("liked tweet");
      expect(contents).toContain("reply liked");
    });

    it("deve incluir parent quando o like for em reply", async () => {
      const replyLiked = await prisma.tweet.create({
        data: {
          content: "reply liked",
          userId: otherUserId,
          parentId: tweetId,
        },
      });

      await prisma.like.create({
        data: {
          userId,
          tweetId: replyLiked.id,
        },
      });

      const res = await request(app)
        .get(`${baseUrl}/${userId}/likes`)
        .set("Authorization", `Bearer ${token}`);

      const reply = res.body.likes.find(
        (l: any) => l.content === "reply liked",
      );

      expect(reply.parent).toBeDefined();
      expect(reply.parent.id).toBe(tweetId);
    });

    it("deve retornar likes ordenados por data decrescente", async () => {
      const older = await prisma.tweet.create({
        data: {
          content: "old tweet",
          userId: otherUserId,
          createdAt: new Date("2020-01-01"),
        },
      });

      await prisma.like.create({
        data: {
          userId,
          tweetId: older.id,
        },
      });

      const res = await request(app)
        .get(`${baseUrl}/${userId}/likes`)
        .set("Authorization", `Bearer ${token}`);

      const likes = res.body.likes;

      for (let i = 1; i < likes.length; i++) {
        const prev = new Date(likes[i - 1].createdAt);
        const curr = new Date(likes[i].createdAt);

        expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
      }
    });

    it("deve retornar lista vazia se usuário não tiver likes", async () => {
      const resNewUser = await request(app)
        .post("/api/users")
        .send({
          name: "No Likes",
          userName: `nolikes_${Date.now()}`,
          email: `nolikes_${Date.now()}@test.com`,
          password: "123456",
        });

      const newUserId = resNewUser.body.user.id;

      const res = await request(app)
        .get(`${baseUrl}/${newUserId}/likes`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.likes).toEqual([]);
    });
  });
});
