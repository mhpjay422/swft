import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { requireUser } from "#app/utils/auth.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import {
  type DataFunctionArgs,
  json,
  type MetaFunction,
} from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";

const prisma = prismaClient;

export async function loader({ request, params }: DataFunctionArgs) {
  const user = await requireUser(request);
  invariantResponse(user.username === params.username, "Not authorized", {
    status: 403,
  });

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
        <p className="text-xl font-semibold mb-4">My Projects</p>
        {data.owner.projects.map((project) => (
          <Link
            key={project.id}
            to={`/users/${data.owner.username}/project/${project.id}`}
          >
            <div className="flex flex-row w-64 rounded-lg hover:bg-gray-50 p-2">
              <div className="h-10 w-10 mr-4 bg-blue-400 rounded-lg"></div>
              <p className="text-sm mt-2.5 font-semibold">{project.title}</p>
            </div>
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
