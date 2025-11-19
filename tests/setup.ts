import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.test" });

export const prisma = new PrismaClient();

export const limparBanco = async () => {
  await prisma.$transaction([
    prisma.like.deleteMany(),
    prisma.follow.deleteMany(),
    prisma.tweet.deleteMany(),
    prisma.user.deleteMany(),
  ]);
};

beforeAll(async () => {
  await prisma.$connect();
  await limparBanco();
});

afterAll(async () => {
  await limparBanco();
  await prisma.$disconnect();
});
