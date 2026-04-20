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
    it("deve buscar replies do usuário com sucesso", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/replies`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.replies)).toBe(true);
      expect(res.body.replies.length).toBeGreaterThan(0);

      expect(res.body.replies[0]).toMatchObject({
        content: "reply test",
      });
    });

    it("deve garantir parent válido na reply", async () => {
      const res = await request(app)
        .get(`${baseUrl}/${userId}/replies`)
        .set("Authorization", `Bearer ${token}`);

      const reply = res.body.replies.find(
        (r: any) => r.content === "reply test",
      );

      expect(reply.parent).toBeDefined();
      expect(reply.parent.id).toBe(tweetId);
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
  });
});
