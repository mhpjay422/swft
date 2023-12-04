import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

const prisma = prismaClient;

export async function loader({ request, params }: DataFunctionArgs) {
  const owner = await prisma.user.findFirst({
    select: {
      tasks: {
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

export async function action({ request, params }: DataFunctionArgs) {
  return json({});
}

export default function UsersProjectDetailPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-grow flex-col items-center mb-32">
      <div className="flex flex-row py-6 px-5 mt-10">
        <ul className="mr-6 w-64">
          To do
          {data.owner.tasks.map((task) => (
            <li
              key={task.id}
              className="h-28 w-64 border border-gray-200 hover:border-gray-400 rounded-lg mb-2"
            >
              <p className="text-sm p-4 font-semibold">{task.title}</p>
            </li>
          ))}
        </ul>
        <ul className="mr-6 w-64">
          Doing
          {data.owner.tasks.map((task) => (
            <li
              key={task.id}
              className="h-28 w-64 border border-gray-200 hover:border-gray-400 rounded-lg mb-2"
            >
              <p className="text-sm p-4 font-semibold">{task.title}</p>
            </li>
          ))}
        </ul>
        <ul className="mr-6 w-64">
          Done
          {data.owner.tasks.map((task) => (
            <li
              key={task.id}
              className="h-28 w-64 border border-gray-200 hover:border-gray-400 rounded-lg mb-2"
            >
              <p className="text-sm p-4 font-semibold">{task.title}</p>
            </li>
          ))}
        </ul>
        <ul className="mr-6 w-64">
          Todo
          {data.owner.tasks.map((task) => (
            <li
              key={task.id}
              className="h-28 w-64 border border-gray-200 hover:border-gray-400 rounded-lg mb-2"
            >
              <p className="text-sm p-4 font-semibold">{task.title}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
