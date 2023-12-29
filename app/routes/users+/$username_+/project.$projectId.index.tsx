import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { AddTaskButtonAndForm } from "#app/components/tasks/add-task-button-and-form.tsx";
import { TaskCard } from "#app/components/tasks/task-card.tsx";
import { useClickOutside } from "#app/hooks/useClickOutside.ts";
import { requireUser } from "#app/utils/auth.server.ts";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { useActionData, useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useRef, createRef, type ElementRef } from "react";
import { flushSync } from "react-dom";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { CSRFError } from "remix-utils/csrf/server";
import { z } from "zod";

const prisma = prismaClient;

const AddTaskFormSchema = z.object({
  title: z.string().min(1).max(32),
  ownerId: z.string(),
  sectionId: z.string(),
});

export const AddSectionFormSchema = z.object({
  title: z.string().min(1).max(32),
  ownerId: z.string().min(5),
  projectId: z.string().min(5),
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
  const [taskModalData, setTaskModalData] = useState<Task | null>(null);
  const [sectionRefs] = useState<Array<React.RefObject<HTMLDivElement>>>(
    data.owner.sections.map(() => createRef())
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isTempBlurSubmitting, setIsTempBlurSubmitting] = useState(false);
  const [addSectionFormIsOpen, setAddSectionFormIsOpen] = useState(false);

  const wrapperRef = useRef(null);
  const addSectionRef = useRef<ElementRef<"form">>(null);
  const addSectionInputRef = useRef<ElementRef<"input">>(null);

  const fetcher = useFetcher({ key: "create-task" });
  const taskTitle = fetcher.formData?.get("title")?.toString();
  const taskSubmittingSectionId = fetcher.formData
    ?.get("sectionId")
    ?.toString();
  const taskIsSubmitting = fetcher.state !== "idle" && taskTitle !== "";
  const sectionHasOptimisticTaskCreation = (sectionId: string | undefined) =>
    taskIsSubmitting && taskSubmittingSectionId === sectionId;

  const deleteFetcher = useFetcher({ key: "delete-task" });
  const deleteTaskSubmittingSectionId = deleteFetcher.formData
    ?.get("sectionId")
    ?.toString();
  const deleteTaskIsSubmitting = deleteFetcher.state !== "idle";

  const addSectionFetcher = useFetcher({ key: "add-section" });

  const sectionHasOptimisticDeletion = (sectionId: string | undefined) =>
    deleteTaskIsSubmitting && deleteTaskSubmittingSectionId === sectionId;
  const sectionEmptyAndIdle = (
    section: { tasks: string | any[] },
    sectionId: string | undefined
  ) => {
    return (
      section.tasks.length === 0 &&
      editingSectionId !== sectionId &&
      !sectionHasOptimisticTaskCreation(sectionId) &&
      !sectionHasOptimisticDeletion(sectionId)
    );
  };

  useClickOutside(wrapperRef, () => {
    setTaskModalData(null);
  });
  useClickOutside(addSectionRef, () => {
    setAddSectionFormIsOpen(false);
  });

  const scrollRightIntoView = () => {
    const current = addSectionRef.current;

    if (current) {
      current.scrollLeft = current.scrollWidth;
    }
  };

  const [form, fields] = useForm({
    id: "add-section-form",
    constraint: getFieldsetConstraint(AddSectionFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: AddSectionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="flex flex-row items-center overflow-x-auto w-screen mb-36 mr-8">
      <div className="flex flex-row pt-6 px-5 w-full">
        {data.owner.sections.map((section, index) => (
          <div key={section.id} className="mr-4 w-[274px]">
            <div className="font-semibold mb-2">{section.title}</div>
            <div
              ref={sectionRefs[index]}
              className={`overflow-x-hidden overflow-y-auto section-max-height h-screen rounded-lg`}
            >
              <div
                className={`w-64 h-full rounded-lg ${
                  sectionEmptyAndIdle(section, section.id) &&
                  !isTempBlurSubmitting
                    ? "bg-gray-50"
                    : "bg-white"
                }`}
              >
                {section.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    setTaskModalData={setTaskModalData}
                    deleteTaskIsSubmitting={deleteTaskIsSubmitting}
                  />
                ))}
                {/* Optimistic update for new task creation */}
                {sectionHasOptimisticTaskCreation(section.id) && (
                  <>
                    <TaskCard title={taskTitle} />
                    <div className="w-full rounded-md bg-white} hover:cursor-wait transition p-3 flex items-center font-medium text-sm">
                      <div className="mx-auto">+ Add a Task</div>
                    </div>
                  </>
                )}
                <div className="shrink-0 w-64 select-none mb-32">
                  {/* Render stand in add task button while optimisticly deleting task. This avoids
                      unsynchronized updating of UI while deleting task.
                  */}
                  {sectionHasOptimisticDeletion(section.id) ? (
                    <div className="w-full rounded-md bg-white p-3 flex items-center font-medium text-sm cursor-wait">
                      <div className="mx-auto">+ Add a Task</div>
                    </div>
                  ) : (
                    <AddTaskButtonAndForm
                      AddTaskFormSchema={AddTaskFormSchema}
                      fetcher={fetcher}
                      actionData={actionData}
                      ownerId={data.owner.id}
                      sectionId={section.id}
                      sectionRef={sectionRefs[index]}
                      sectionEmptyAndIdle={sectionEmptyAndIdle(
                        section,
                        section.id
                      )}
                      isEditing={editingSectionId === section.id}
                      sectionHasOptimisticTaskCreation={sectionHasOptimisticTaskCreation(
                        section.id
                      )}
                      setEditingSectionId={setEditingSectionId}
                      setIsTempBlurSubmitting={setIsTempBlurSubmitting}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div
          className="w-[274px] hover:cursor-pointer"
          onClick={() => {
            flushSync(() => {
              setAddSectionFormIsOpen(true);
            });
            addSectionInputRef.current?.select();
          }}
        >
          {addSectionFormIsOpen ? (
            <addSectionFetcher.Form
              {...form.props}
              method="POST"
              action="/section-create"
              ref={addSectionRef}
              // action={ }
              onBlur={() => {
                scrollRightIntoView();
              }}
            >
              <AuthenticityTokenInput />
              <input
                ref={addSectionInputRef}
                type="text"
                {...conform.input(fields.title)}
                className="w-64 mb-1.5 text-sm px-2 h-8 font-medium border-transparent hover:border-input focus:border-input transition"
                placeholder="Enter section title..."
                // onFocus={}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setAddSectionFormIsOpen(false);
                  }
                }}
              />
              <input
                {...conform.input(fields.ownerId, { type: "hidden" })}
                value={data.owner.id}
              />
              <input
                {...conform.input(fields.projectId, { type: "hidden" })}
                value={data.projectId}
              />
            </addSectionFetcher.Form>
          ) : (
            <div className="font-semibold mb-2 pl-2 w-64 hover:bg-gray-50 hover:cursor-pointer rounded-lg">
              {" "}
              + Add section
            </div>
          )}
          <div className="overflow-x-hidden overflow-y-auto section-max-height h-screen rounded-lg">
            <div className="w-64 h-full rounded-lg bg-gray-50"></div>
          </div>
        </div>
      </div>
      {taskModalData !== null && (
        <div className="absolute h-screen w-screen top-0 left-0 bg-black/[.60] overflow-scroll ">
          <div
            ref={wrapperRef}
            id="task-modal"
            className="flex flex-col bg-zinc-100 opacity-100 text-black flex-grow h-full w-[50%] p-8 mt-28 mb-16 mx-auto border border-gray-200 rounded-2xl"
          >
            <div className="flex flex-row justify-between w-full font-semibold text-xl mb-16">
              <div>{taskModalData.title}</div>
              <deleteFetcher.Form
                method="DELETE"
                action="/task-delete"
                onSubmit={() => setTaskModalData(null)}
              >
                <AuthenticityTokenInput />
                <input type="hidden" name="taskId" value={taskModalData.id} />
                <input
                  type="hidden"
                  name="sectionId"
                  value={taskModalData.sectionId ?? ""}
                />
                <button
                  type="submit"
                  className="bg-red-500 text-white h-10 w-20 rounded-lg border border-gray-100 hover:bg-red-600 text-center self-center text-base"
                >
                  Delete
                </button>
              </deleteFetcher.Form>
            </div>
            <div className="flex flex-row mb-8">
              <div className="mr-2">Completed:</div>
              {taskModalData.completed ? (
                <div className="h-6 w-6">
                  <svg
                    data-slot="icon"
                    fill="none"
                    stroke-width="4"
                    stroke="#34cb45"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m4.5 12.75 6 6 9-13.5"
                    ></path>
                  </svg>
                </div>
              ) : (
                <div className="h-7 w-7">
                  <svg
                    data-slot="icon"
                    fill="#fd0207"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z"></path>
                  </svg>
                </div>
              )}
            </div>
            <div>
              Description:
              <div className="border border-gray-300 hover:border-gray-400 p-4 rounded-lg h-96 hover:cursor-text cursor">
                {taskModalData.description}
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
