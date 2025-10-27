import { prisma } from "../config/prisma.config";
import { CreateUserDto } from "../dtos/create.user.dto";
import { mapUser } from "../mappers/user.mapper";
import { User } from "../interfaces/user.interface";
import { UserLoginDto } from "../dtos/user.login.dto";

export class UserRepository {
  async criarUsuario(dto: CreateUserDto): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: dto.name,
        userName: dto.userName,
        email: dto.email,
        password: dto.password,
        imageUrl: dto.imageUrl,
      },
      include: {
        tweets: true,
        followers: true,
        following: true,
        likes: true,
      },
    });

    return mapUser(user);
  }

  async buscarPorId(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        tweets: true,
        followers: true,
        following: true,
        likes: true,
      },
    });

    return user ? mapUser(user) : null;
  }

  async buscarPorIdentificador(dto: UserLoginDto): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { userName: dto.identifier }],
      },
      include: {
        tweets: true,
        followers: true,
        following: true,
        likes: true,
      },
    });

    return user ? mapUser(user) : null;
  }
}
