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
      findProfileReplies: jest.fn(),
      findProfileLikes: jest.fn(),
      findTweetById: jest.fn(),
      findUserRepliesIds: jest.fn(),
      findConversations: jest.fn(),
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

  describe("ProfileService - getRootId", () => {
    it("deve subir até o root corretamente", async () => {
      const serviceAny = service as any;

      jest
        .spyOn(mockProfileRepository, "findTweetById")
        .mockResolvedValueOnce({ id: "3", parentId: "2" } as any)
        .mockResolvedValueOnce({ id: "2", parentId: "1" } as any)
        .mockResolvedValueOnce({ id: "1", parentId: null } as any);

      const rootId = await serviceAny.getRootId("3");

      expect(rootId).toBe("1");
    });

    it("deve retornar o próprio id se já for root", async () => {
      const serviceAny = service as any;

      jest
        .spyOn(mockProfileRepository, "findTweetById")
        .mockResolvedValueOnce({ id: "1", parentId: null } as any);

      const rootId = await serviceAny.getRootId("1");

      expect(rootId).toBe("1");
    });

    it("deve retornar null se tweet não existir", async () => {
      const serviceAny = service as any;

      jest
        .spyOn(mockProfileRepository, "findTweetById")
        .mockResolvedValueOnce(null);

      const rootId = await serviceAny.getRootId("999");

      expect(rootId).toBeNull();
    });
  });

  describe("ProfileService - getProfileReplies", () => {
    it("deve retornar lista de tweets da conversa", async () => {
      mockProfileRepository.findUserRepliesIds = jest
        .fn()
        .mockResolvedValue([{ id: "reply1" }]);

      jest.spyOn(service as any, "getRootId").mockResolvedValue("root1");

      const tweet = makeTweet();

      mockProfileRepository.findConversations = jest
        .fn()
        .mockResolvedValue([tweet] as any);

      const result = await service.getProfileReplies("user1", "user1");

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: tweet.id,
        content: tweet.content,
        likesCount: tweet._count.likes,
      });
    });

    it("deve chamar findConversations com rootIds corretos", async () => {
      mockProfileRepository.findUserRepliesIds = jest
        .fn()
        .mockResolvedValue([{ id: "reply1" }]);

      jest.spyOn(service as any, "getRootId").mockResolvedValue("root1");

      mockProfileRepository.findConversations = jest.fn().mockResolvedValue([]);

      await service.getProfileReplies("user1", "user1");

      expect(mockProfileRepository.findConversations).toHaveBeenCalledWith(
        ["root1"],
        "user1",
      );
      expect(service["getRootId"]).toHaveBeenCalledWith("reply1");
    });

    it("deve lançar erro se usuário não existir", async () => {
      mockUserRepository.buscarPorId.mockResolvedValue(null);

      await expect(service.getProfileReplies("user1", "user1")).rejects.toThrow(
        "Usuário não encontrado.",
      );
    });

    it("deve lidar com múltiplos roots", async () => {
      mockProfileRepository.findUserRepliesIds = jest
        .fn()
        .mockResolvedValue([{ id: "r1" }, { id: "r2" }]);

      jest
        .spyOn(service as any, "getRootId")
        .mockResolvedValueOnce("root1")
        .mockResolvedValueOnce("root2");

      mockProfileRepository.findConversations = jest.fn().mockResolvedValue([]);

      await service.getProfileReplies("user1", "user1");

      expect(mockProfileRepository.findConversations.mock.calls[0][0]).toEqual(
        expect.arrayContaining(["root1", "root2"]),
      );
    });

    it("deve retornar lista vazia se não houver replies", async () => {
      mockProfileRepository.findUserRepliesIds = jest
        .fn()
        .mockResolvedValue([]);

      mockProfileRepository.findConversations = jest.fn().mockResolvedValue([]);

      const result = await service.getProfileReplies("user1", "user1");

      expect(result).toEqual([]);
    });

    it("deve buscar replies, resolver roots e buscar conversas", async () => {
      mockProfileRepository.findUserRepliesIds = jest
        .fn()
        .mockResolvedValue([{ id: "reply1" }]);

      jest.spyOn(service as any, "getRootId").mockResolvedValue("root1");

      mockProfileRepository.findConversations = jest.fn().mockResolvedValue([]);

      await service.getProfileReplies("user1", "loggedUser");

      expect(mockProfileRepository.findUserRepliesIds).toHaveBeenCalledWith(
        "user1",
      );
      expect(mockProfileRepository.findConversations).toHaveBeenCalledWith(
        ["root1"],
        "loggedUser",
      );
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
