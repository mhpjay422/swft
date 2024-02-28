import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { bcrypt } from "#app/utils/auth.server.ts";
import { createId as cuid } from "@paralleldrive/cuid2";

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
  // NOTE: Setting the projectId like this doesnt feel right
  // Maybe we should for loop create each model and connect them separately so
  // we can get the id from them
  const projectId = cuid();
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
          id: projectId,
          title: "Admin Project",
          sections: {
            create: seedSectionNames.map((name) => ({
              title: name,
              owner: {
                connect: { username: "admin" },
              },
              order: 1,
              tasks: {
                create: {
                  title: "My first Task",
                  description: "This is my first task",
                  completed: Math.random() > 0.5,
                  owner: {
                    connect: { username: "admin" },
                  },
                  projects: {
                    connect: {
                      id: projectId,
                    },
                  },
                },
              },
            })),
          },
        },
      },
    },
  });

  function createSeedUserData(order: number) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const projectId = cuid();

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
          id: projectId,
          title: `${firstName}${lastName}s first project`,
          sections: {
            create: seedSectionNames.map((name) => ({
              title: name,
              owner: {
                connect: { username: `${firstName}${lastName}` },
              },
              order: order,
              tasks: {
                create: tasks.map((task) => ({
                  ...task,
                  owner: {
                    connect: { username: `${firstName}${lastName}` },
                  },
                  projects: {
                    connect: {
                      id: projectId,
                    },
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

  for (let i = 0; i < numCreateSeedUsers; i++) {
    await prisma.user.create({
      data: await createSeedUserData(i + 2),
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
