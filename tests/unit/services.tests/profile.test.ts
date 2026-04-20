import { ProfileRepository } from "./../../../src/repositories/profile.repository";
import { UserRepository } from "../../../src/repositories/user.repository";
import { ProfileService } from "../../../src/services/profile.service";

describe("ProfileService", () => {
  let service: ProfileService;
  let mockProfileRepository: jest.Mocked<ProfileRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;

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

    parent: null,

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
    it("deve retornar replies", async () => {
      mockProfileRepository.findProfileReplies.mockResolvedValue([
        makeTweet(),
      ] as any);

      const result = await service.getProfileReplies("user1", "user1");

      expect(result).toHaveLength(1);
    });

    it("deve lançar erro se usuário não existir", async () => {
      mockUserRepository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.getProfileReplies("user1", "user1"),
      ).rejects.toMatchObject({
        message: "Usuário não encontrado.",
      });
    });

    it("deve mapear replies corretamente", async () => {
      const tweet = makeTweet();

      mockProfileRepository.findProfileReplies.mockResolvedValue([
        tweet,
      ] as any);

      const result = await service.getProfileReplies("user1", "user1");

      expect(result[0]).toMatchObject({
        id: tweet.id,
        content: tweet.content,
        likesCount: tweet._count.likes,
        repliesCount: tweet._count.replies,
      });
    });

    it("deve chamar repository de replies corretamente", async () => {
      mockProfileRepository.findProfileReplies.mockResolvedValue([
        makeTweet(),
      ] as any);

      await service.getProfileReplies("user1", "loggedUser");

      expect(mockProfileRepository.findProfileReplies).toHaveBeenCalledWith(
        "user1",
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
