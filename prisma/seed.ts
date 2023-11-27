import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { bcrypt } from "#app/utils/auth.server.ts";

const prisma = new PrismaClient();

await prisma.user.deleteMany();

await prisma.user.create({
  data: {
    email: "admin@email.com",
    name: "Admin",
    username: "admin",
    password: {
      create: {
        hash: bcrypt.hashSync("mindaa", 10),
      },
    },
    project: {
      create: {
        title: "Admin Project",
      },
    },
  },
});

function createSeedUserData() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    email: faker.internet.email(),
    username: `${firstName}${lastName}`,
    name: `${firstName} ${lastName}`,
    password: {
      create: {
        hash: bcrypt.hashSync(faker.internet.password(), 10),
      },
    },
    project: {
      create: {
        title: "My Project",
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
