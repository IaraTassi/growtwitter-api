import { prisma } from "../config/prisma.config";
import { CreateUserDto } from "../dtos/create.user.dto";
import { mapUser } from "../mappers/user.mapper";
import { User } from "../interfaces/user.interface";

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

  async buscarPorIdentificador(identifier: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userName: identifier }],
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
