import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

await prisma.user.deleteMany();

await prisma.user.create({
  data: {
    email: "admin@email.com",
    name: "Admin",
    password: {
      create: {
        hash: "minda",
      },
    },
  },
});
