import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import {
  type DataFunctionArgs,
  json,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

const prisma = prismaClient;

export async function loader({ params }: DataFunctionArgs) {
  const owner = await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
      username: true,
      projects: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    where: { username: params.username },
  });

  invariantResponse(owner, "Owner not found", { status: 404 });

  return json({ owner });
}

export async function action({ request }: DataFunctionArgs) {}

export default function UserHomeProfilePage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col sm:mx-8 md:mx-32 lg:mx-64 w-full h-96 mt-20 border border-gray-200 hover:border-gray-300 rounded-lg">
      <div className="p-8 ">
        <p className="text-xl font-semibold">My Projects</p>
        {data.owner.projects.map((project) => (
          <Link
            key={project.id}
            to={`/users/${data.owner.username}/project/${project.id}`}
          >
            <p className=" text-blue-600">Title: {project.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: "Your profile homepage at SWFT" }];
};

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
