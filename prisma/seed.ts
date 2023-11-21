import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

await prisma.user.deleteMany();

await prisma.user.create({
  data: {
    email: "admin@email.com",
    name: "Admin",
    password: {
      create: {
        hash: bcrypt.hashSync("mindaa", 10),
      },
    },
  },
});

function createSeedUserData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    email: faker.internet.email(),
    name: `${firstName} ${lastName}`,
    password: {
      create: {
        hash: bcrypt.hashSync(faker.internet.password(), 10),
      },
    },
  };
}

const numCreateSeedUsers = 3;

for (let i = 0; i <= numCreateSeedUsers; i++) {
  await prisma.user.create({
    data: createSeedUserData(),
  });
}
