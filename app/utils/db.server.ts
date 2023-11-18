import { PrismaClient } from "@prisma/client";

let prismClient: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prismClient = new PrismaClient();
} else {
  if (!(global as any).prisma) {
    (global as any).prisma = new PrismaClient();
  }
  prismClient = (global as any).prisma;
}

export default prismClient;
