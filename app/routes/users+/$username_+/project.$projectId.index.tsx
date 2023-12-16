import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { AddTaskButton } from "#app/components/ui/add-task-button.tsx";
import { useClickOutside } from "#app/hooks/useClickOutside.ts";
import { requireUser } from "#app/utils/auth.server.ts";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { parse } from "@conform-to/zod";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { useState, useRef } from "react";
import { CSRFError } from "remix-utils/csrf/server";
import { z } from "zod";

const prisma = prismaClient;

const AddTaskFormSchema = z.object({
  title: z.string().min(1).max(255),
  ownerId: z.string(),
  sectionId: z.string(),
});

type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  projectId: string | null;
  sectionId: string | null;
} | null;

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
      sections: {
        select: {
          id: true,
          title: true,
          tasks: true,
        },
      },
    },
    where: { username: params.username },
  });

  invariantResponse(owner, "Owner not found", { status: 404 });

  return json({ owner, projectId: params.projectId });
}

export async function action({ request, params }: DataFunctionArgs) {
  const formData = await request.formData();

  try {
    await csrf.validate(formData, request.headers);
  } catch (error) {
    if (error instanceof CSRFError) {
      throw new Response("Invalid CSRF token", { status: 403 });
    }
  }

  const submission = await parse(formData, {
    schema: (intent) =>
      AddTaskFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, task: null };

        const task = await prisma.task.create({
          data: {
            title: data.title,
            ownerId: data.ownerId,
            sectionId: data.sectionId,
            projectId: params.projectId,
          },
        });

        if (!task) {
          ctx.addIssue({
            code: "custom",
            message: "Unable to create task",
          });
          return z.NEVER;
        }

        return {
          ...data,
          task,
        };
      }),
    async: true,
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }

  if (!submission.value?.task) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  return json({ status: "success", submission } as const, { status: 200 });
}

export default function UsersProjectDetailPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isTaskModalOpenAndData, setIsTaskModalOpenAndData] = useState<
    [boolean, Task]
  >([false, null]);
  const wrapperRef = useRef(null);
  const handleOutsideClick = () => {
    setIsTaskModalOpenAndData([false, null]);
  };

  useClickOutside(wrapperRef, handleOutsideClick);

  return (
    <div className="flex flex-grow flex-col items-center">
      <div className="flex flex-row py-6 px-5 mt-10">
        {data.owner.sections.map((section) => (
          <div key={section.id} className="mr-6 w-72">
            <div className="font-semibold mb-2">{section.title}</div>
            <div className="overflow-x-hidden overflow-y-auto max-h-screen pb-96">
              {section.tasks.map((task) => (
                <div
                  key={task.id}
                  className="h-28 w-64 p-4 border border-gray-200 hover:border-gray-400 hover:cursor-pointer rounded-lg mb-2"
                  onClick={() => setIsTaskModalOpenAndData([true, task])}
                >
                  {task.title}
                </div>
              ))}
              <div className="shrink-0 w-96 select-none">
                <AddTaskButton
                  AddTaskFormSchema={AddTaskFormSchema}
                  actionData={actionData}
                  ownerId={data.owner.id}
                  sectionId={section.id}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {isTaskModalOpenAndData[0] && isTaskModalOpenAndData[1] !== null && (
        <div className="absolute h-screen w-screen top-0 left-0 bg-black/[.60] overflow-scroll ">
          <div
            ref={wrapperRef}
            id="task-modal"
            className="flex flex-col bg-zinc-100 opacity-100 text-black flex-grow h-full w-[50%] p-8 mt-28 mb-16 mx-auto border border-gray-200 rounded-2xl"
          >
            <div className="font-semibold text-xl mb-16">
              {isTaskModalOpenAndData[1].title}
            </div>
            <div className="mb-8">
              Completed: {isTaskModalOpenAndData[1].completed ? "Yes" : "No"}
            </div>
            <div>
              Description:
              <div className="border border-gray-300 hover:border-gray-400 p-4 rounded-lg h-96 hover:cursor-text">
                {isTaskModalOpenAndData[1].description}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
