import { ProfileRepository } from "./../../../src/repositories/profile.repository";
import { UserRepository } from "../../../src/repositories/user.repository";
import { ProfileService } from "../../../src/services/profile.service";

describe("ProfileService", () => {
  let service: ProfileService;
  let mockProfileRepository: jest.Mocked<ProfileRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: "user1",
    name: "User",
    userName: "user",
    email: "user@mail.com",
    password: "123",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const makeTweet = () => ({
    id: "tweet1",
    content: "Olá mundo",
    createdAt: new Date(),

    user: {
      id: "user1",
      name: "User",
      userName: "user",
      imageUrl: null,
    },

    parent: {
      id: "parent1",
      user: {
        id: "user2",
        name: "Parent",
        userName: "parent",
        imageUrl: null,
      },
    },

    likes: [{ userId: "user1" }],

    _count: {
      likes: 2,
      replies: 3,
    },
  });

  beforeEach(() => {
    mockProfileRepository = {
      findProfileTweets: jest.fn(),
      findProfileLikes: jest.fn(),
      findById: jest.fn(),
      findUserParticipations: jest.fn(),
      findAllTweetsBasic: jest.fn(),
    } as any;

    mockUserRepository = {
      buscarPorId: jest.fn().mockResolvedValue(mockUser),
    } as any;

    service = new ProfileService();

    (service as any).profileRepository = mockProfileRepository;
    (service as any).userRepository = mockUserRepository;
  });

  describe("ProfileService - getProfileTweets", () => {
    it("deve retornar tweets do usuário", async () => {
      mockProfileRepository.findProfileTweets.mockResolvedValue([
        makeTweet(),
      ] as any);

      const result = await service.getProfileTweets("user1", "user1");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "tweet1",
        content: "Olá mundo",
        likesCount: 2,
        repliesCount: 3,
        likedByMe: true,
      });

      expect(mockProfileRepository.findProfileTweets).toHaveBeenCalledWith(
        "user1",
        "user1",
      );
    });

    it("deve retornar array vazio", async () => {
      mockProfileRepository.findProfileTweets.mockResolvedValue([]);

      const result = await service.getProfileTweets("user1", "user1");

      expect(result).toEqual([]);
    });

    it("deve lançar erro se userId não for informado", async () => {
      await expect(service.getProfileTweets("", "user1")).rejects.toMatchObject(
        {
          message: "O ID do usuário é obrigatório.",
        },
      );
    });

    it("deve lançar erro se usuário não existir", async () => {
      mockUserRepository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.getProfileTweets("user1", "user1"),
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
      });
    });

    it("deve chamar repository com userId e loggedUserId", async () => {
      mockProfileRepository.findProfileTweets.mockResolvedValue([
        makeTweet(),
      ] as any);

      await service.getProfileTweets("user1", "loggedUser");

      expect(mockProfileRepository.findProfileTweets).toHaveBeenCalledWith(
        "user1",
        "loggedUser",
      );
    });
  });

  describe("ProfileService - getProfileReplies", () => {
    it("deve retornar threads em árvore corretamente", async () => {
      mockProfileRepository.findUserParticipations.mockResolvedValue([
        { id: "2", parentId: "1" },
      ]);

      mockProfileRepository.findById
        .mockResolvedValueOnce({ id: "2", parentId: "1" })
        .mockResolvedValueOnce({ id: "1", parentId: null });

      mockProfileRepository.findAllTweetsBasic.mockResolvedValue([
        {
          id: "1",
          content: "root",
          createdAt: new Date("2026-01-01"),
          parentId: null,
          user: { name: "A", userName: "a", imageUrl: null },
        },
        {
          id: "2",
          content: "reply",
          createdAt: new Date("2026-01-02"),
          parentId: "1",
          user: { name: "B", userName: "b", imageUrl: null },
        },
      ] as any);

      const result = await service.getProfileReplies("user1");

      const root = result.find((r) => r.id === "1");

      expect(root).toBeDefined();
      expect(root!.replies).toHaveLength(1);

      const reply = root!.replies.find((r) => r.id === "2");

      expect(reply).toBeDefined();
      expect(reply!.content).toBe("reply");
    });

    it("deve retornar vazio se usuário não participou", async () => {
      mockProfileRepository.findUserParticipations.mockResolvedValue([]);

      const result = await service.getProfileReplies("user1");

      expect(result).toEqual([]);
    });

    it("deve lançar erro se usuário não existir", async () => {
      mockUserRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.getProfileReplies("user1")).rejects.toThrow(
        "Usuário não encontrado.",
      );
    });

    it("deve montar árvore com múltiplos níveis", async () => {
      mockProfileRepository.findUserParticipations.mockResolvedValue([
        { id: "3", parentId: "2" },
      ]);

      mockProfileRepository.findById
        .mockResolvedValueOnce({ id: "3", parentId: "2" })
        .mockResolvedValueOnce({ id: "2", parentId: "1" })
        .mockResolvedValueOnce({ id: "1", parentId: null });

      mockProfileRepository.findAllTweetsBasic.mockResolvedValue([
        {
          id: "1",
          content: "root",
          createdAt: new Date("2026-01-01"),
          parentId: null,
          user: { name: "A", userName: "a", imageUrl: null },
        },
        {
          id: "2",
          content: "level 1",
          createdAt: new Date("2026-01-02"),
          parentId: "1",
          user: { name: "B", userName: "b", imageUrl: null },
        },
        {
          id: "3",
          content: "level 2",
          createdAt: new Date("2026-01-03"),
          parentId: "2",
          user: { name: "C", userName: "c", imageUrl: null },
        },
      ] as any);

      const result = await service.getProfileReplies("user1");

      const root = result.find((r) => r.id === "1");
      const level1 = root?.replies.find((r) => r.id === "2");
      const level2 = level1?.replies.find((r) => r.id === "3");

      expect(level2?.content).toBe("level 2");
    });

    it("deve ordenar replies corretamente por data", async () => {
      mockProfileRepository.findUserParticipations.mockResolvedValue([
        { id: "2", parentId: "1" },
      ]);

      mockProfileRepository.findById
        .mockResolvedValueOnce({ id: "2", parentId: "1" })
        .mockResolvedValueOnce({ id: "1", parentId: null });

      mockProfileRepository.findAllTweetsBasic.mockResolvedValue([
        {
          id: "1",
          content: "root",
          createdAt: new Date("2026-01-01"),
          parentId: null,
          user: { name: "A", userName: "a", imageUrl: null },
        },
        {
          id: "3",
          content: "reply mais novo",
          createdAt: new Date("2026-01-03"),
          parentId: "1",
          user: { name: "B", userName: "b", imageUrl: null },
        },
        {
          id: "2",
          content: "reply mais antigo",
          createdAt: new Date("2026-01-02"),
          parentId: "1",
          user: { name: "C", userName: "c", imageUrl: null },
        },
      ] as any);

      const result = await service.getProfileReplies("user1");

      const root = result.find((r) => r.id === "1");

      const contents = root!.replies.map((r) => r.content);

      expect(contents).toEqual(["reply mais antigo", "reply mais novo"]);
    });
  });

  describe("ProfileService - getProfileLikes", () => {
    it("deve retornar tweets curtidos", async () => {
      mockProfileRepository.findProfileLikes.mockResolvedValue([
        makeTweet(),
      ] as any);

      const result = await service.getProfileLikes("user1", "user1");

      expect(result).toHaveLength(1);
      expect(result[0].likedByMe).toBe(true);
    });

    it("deve lançar erro se usuário não existir", async () => {
      mockUserRepository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.getProfileLikes("user1", "user1"),
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
      });
    });

    it("deve chamar repository de likes corretamente", async () => {
      mockProfileRepository.findProfileLikes.mockResolvedValue([
        makeTweet(),
      ] as any);

      await service.getProfileLikes("user1", "loggedUser");

      expect(mockProfileRepository.findProfileLikes).toHaveBeenCalledWith(
        "user1",
        "loggedUser",
      );
    });

    it("deve mapear likes corretamente", async () => {
      const tweet = makeTweet();

      mockProfileRepository.findProfileLikes.mockResolvedValue([tweet] as any);

      const result = await service.getProfileLikes("user1", "user1");

      expect(result[0]).toMatchObject({
        id: tweet.id,
        likesCount: tweet._count.likes,
        repliesCount: tweet._count.replies,
        likedByMe: true,
      });
    });
  });
});
