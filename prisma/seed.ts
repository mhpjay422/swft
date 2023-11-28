import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { bcrypt } from "#app/utils/auth.server.ts";

const prisma = new PrismaClient();

await prisma.user.deleteMany();

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
          tasks: {
            create: [
              {
                title: "Task 1",
                content: "Task 1 Content",
                completed: false,
                owner: {
                  connect: { username: "admin" },
                },
              },
              {
                title: "Task 2",
                content: "Task 2 Content",
                completed: true,
                owner: {
                  connect: { username: "admin" },
                },
              },
            ],
          },
        },
      },
    },
  });

  function createSeedUserData() {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const createRandomTask = () => ({
      title: faker.lorem.words(),
      content: faker.lorem.paragraph(),
      completed: faker.datatype.boolean(0.5),
    });

    const tasks = Array.from({ length: 3 }, createRandomTask);

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
          tasks: {
            create: tasks.map((task) => ({
              ...task,
              owner: {
                connect: { username: `${firstName}${lastName}` },
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
      data: createSeedUserData(),
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
