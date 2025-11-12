import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

const envFile =
  process.env.NODE_ENV === "test"
    ? ".env.test"
    : process.env.NODE_ENV === "production"
    ? ".env.prod"
    : ".env.dev";

dotenv.config({ path: envFile });

console.log(`🌱 Ambiente carregado: ${process.env.NODE_ENV || "dev"}`);

export const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});
