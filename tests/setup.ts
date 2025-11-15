import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.test" });

export const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

export const limparBanco = async () => {
  try {
    await prisma.$transaction([
      prisma.user.deleteMany(),
      prisma.tweet.deleteMany(),
      prisma.like.deleteMany(),
      prisma.follow.deleteMany(),
    ]);
  } catch (err) {
    console.error("Erro ao limpar banco de testes:", err);
  }
};

beforeEach(async () => {
  await limparBanco();
});

afterAll(async () => {
  await prisma.$disconnect();
});
