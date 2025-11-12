import * as dotenv from "dotenv";
import path from "path";
import { prisma } from "../src/config/prisma.config";

dotenv.config({ path: path.resolve(__dirname, "../.env.test") });

console.log("🧩 Ambiente de teste carregado:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log(
  "  DATABASE_URL:",
  process.env.DATABASE_URL?.includes("myapp_test") ? "✅ OK" : "❌ INCORRETO"
);
console.log("  JWT_SECRET:", process.env.JWT_SECRET ? "✅ OK" : "❌ AUSENTE");

export const limparBanco = async () => {
  try {
    await prisma.like.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.tweet.deleteMany();
    await prisma.user.deleteMany();
  } catch (err) {
    console.error("Erro ao limpar banco de testes:", err);
  }
};

afterAll(async () => {
  await prisma.$disconnect();
});
