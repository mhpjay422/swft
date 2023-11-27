import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import {
  type DataFunctionArgs,
  json,
  type MetaFunction,
} from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

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

export default function HomePage() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col mx-96 w-auto h-96 mt-20 border border-gray-200 hover:border-gray-300 rounded-lg">
      <div className="p-8 ">
        <p className="text-xl font-semibold">Projects</p>
        {data.owner.projects.map((project) => (
          <p key={project.id}>Title: {project.title}</p>
        ))}
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: "Your homepage at SWFT" }];
};

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
