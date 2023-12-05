import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { bcrypt } from "#app/utils/auth.server.ts";

const prisma = new PrismaClient();

await prisma.user.deleteMany();

const seedSectionNames = ["To do", "Doing", "Done"];

const createRandomTask = () => ({
  title: faker.lorem.words(),
  description: faker.lorem.paragraph(),
  completed: faker.datatype.boolean(0.5),
});
const tasks = Array.from({ length: 3 }, createRandomTask);

const seedData = async () => {
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
      projects: {
        create: {
          title: "Admin Project",
          sections: {
            create: seedSectionNames.map((name) => ({
              title: name,
              owner: {
                connect: { username: "admin" },
              },
              tasks: {
                create: tasks.map((task) => ({
                  ...task,
                  owner: {
                    connect: { username: "admin" },
                  },
                })),
              },
            })),
          },
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
      projects: {
        create: {
          title: "My Project",
          sections: {
            create: seedSectionNames.map((name) => ({
              title: name,
              owner: {
                connect: { username: `${firstName}${lastName}` },
              },
              tasks: {
                create: tasks.map((task) => ({
                  ...task,
                  owner: {
                    connect: { username: `${firstName}${lastName}` },
                  },
                })),
              },
            })),
          },
        },
      },
    };
  }

  const numCreateSeedUsers = 3;

  for (let i = 0; i <= numCreateSeedUsers; i++) {
    await prisma.user.create({
      data: await createSeedUserData(),
    });
  }
};

seedData()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
