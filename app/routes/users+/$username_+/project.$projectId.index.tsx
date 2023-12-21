import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { AddTaskButtonAndForm } from "#app/components/tasks/add-task-button-and-form.tsx";
import { TaskCard } from "#app/components/tasks/task-card.tsx";
import { useClickOutside } from "#app/hooks/useClickOutside.ts";
import { requireUser } from "#app/utils/auth.server.ts";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { parse } from "@conform-to/zod";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { useActionData, useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useRef, createRef } from "react";
import { CSRFError } from "remix-utils/csrf/server";
import { z } from "zod";

const prisma = prismaClient;

const AddTaskFormSchema = z.object({
  title: z.string().min(1).max(32),
  ownerId: z.string(),
  sectionId: z.string(),
});

export type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  projectId: string | null;
  sectionId: string | null;
};

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

        if (!data.title) {
          return;
        }

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

  if (submission.intent !== "submit" || !submission.value?.task) {
    return json({ status: "idle", submission } as const);
  }

  return json({ status: "success", submission } as const, { status: 200 });
}

export default function UsersProjectDetailPage() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [isTaskModalOpenAndData, setIsTaskModalOpenAndData] = useState<
    [boolean, Task | null]
  >([false, null]);
  const [sectionRefs] = useState<Array<React.RefObject<HTMLDivElement>>>(
    data.owner.sections.map(() => createRef())
  );
  const wrapperRef = useRef(null);
  const fetcher = useFetcher({ key: "create-task" });
  const taskTitle = fetcher.formData?.get("title")?.toString();
  const taskSectionId = fetcher.formData?.get("sectionId")?.toString();
  const taskIsSubmitting = fetcher.state !== "idle" && taskTitle !== "";

  useClickOutside(wrapperRef, () => {
    setIsTaskModalOpenAndData([false, null]);
  });

  return (
    <div className="flex flex-col items-center overflow-x-auto w-screen mb-36 mr-8">
      <div className="flex flex-row pt-6 px-5 w-full">
        {data.owner.sections.map((section, index) => (
          <div key={section.id} className="mr-4 w-[274px]">
            <div className="font-semibold mb-2">{section.title}</div>
            <div
              ref={sectionRefs[index]}
              className="overflow-x-hidden overflow-y-auto section-max-height"
            >
              {section.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  setIsTaskModalOpenAndData={setIsTaskModalOpenAndData}
                />
              ))}
              {/* Optimistic update for new task creation */}
              {taskIsSubmitting && taskSectionId === section.id && (
                <TaskCard title={taskTitle} />
              )}
              <div className="shrink-0 w-64 select-none mb-32">
                <AddTaskButtonAndForm
                  AddTaskFormSchema={AddTaskFormSchema}
                  fetcher={fetcher}
                  actionData={actionData}
                  ownerId={data.owner.id}
                  sectionId={section.id}
                  sectionRef={sectionRefs[index]}
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
              <div className="border border-gray-300 hover:border-gray-400 p-4 rounded-lg h-96 hover:cursor-text cursor">
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
