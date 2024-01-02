import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { SectionDropdown } from "#app/components/section-dropdown.tsx";
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
import { useState, useRef, createRef, type ElementRef, useEffect } from "react";
import { flushSync } from "react-dom";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { CSRFError } from "remix-utils/csrf/server";
import { z } from "zod";

export type Task = {
  id: string;
  title: string;
  description: string | null | undefined;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  projectId: string | null;
  sectionId: string | null;
};

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

export const EditSectionFormSchema = z.object({
  title: z.string(),
  sectionId: z.string(),
  ownerId: z.string().min(5),
  index: z.number(),
});

export const EditTaskDescriptionFormSchema = z.object({
  taskId: z.string(),
  description: z.string(),
  ownerId: z.string().min(5),
});

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
  const [sectionBodyRefs] = useState<Array<React.RefObject<HTMLDivElement>>>(
    data.owner.sections.map(() => createRef())
  );
  const [editSectionTitleRefs] = useState<
    Array<React.RefObject<HTMLFormElement>>
  >(data.owner.sections.map(() => createRef()));
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingTaskDescriptionId, setEditingTaskDescriptionId] = useState<
    string | null
  >(null);
  const [isTempBlurSubmitting, setIsTempBlurSubmitting] = useState(false);
  const [addSectionCreateFormIsOpen, setAddSectionCreateFormIsOpen] =
    useState(false);
  const [editSectionFormIndex, setEditSectionFormIndex] = useState<
    null | number
  >(null);

  const projectPageRef = useRef<ElementRef<"div">>(null);
  const wrapperRef = useRef<ElementRef<"div">>(null);

  const addSectionRef = useRef<ElementRef<"form">>(null);
  const addSectionInputRef = useRef<ElementRef<"input">>(null);
  const editSectionInputRef = useRef<ElementRef<"input">>(null);

  const editTaskDescriptionRef = useRef<ElementRef<"form">>(null);
  const editTaskDescriptionInputRef = useRef<ElementRef<"textarea">>(null);

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
  const sectionHasOptimisticDeletion = (sectionId: string | undefined) =>
    deleteTaskIsSubmitting && deleteTaskSubmittingSectionId === sectionId;

  const addSectionFetcher = useFetcher({ key: "add-section" });
  const editSectionFetcher = useFetcher({ key: "edit-section" });
  const editTaskDescriptionFetcher = useFetcher({
    key: "edit-task",
  });

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
    setAddSectionCreateFormIsOpen(false);
  });
  useClickOutside(editTaskDescriptionRef, () => {
    setEditingTaskDescriptionId(null);
  });

  const scrollRightIntoView = () => {
    const current = projectPageRef.current;

    if (current) {
      current.scrollLeft = current.scrollWidth;
    }
  };

  const isFirstRender = useRef(true);

  const [prevSectionsLength, setPrevSectionsLength] = useState(
    data.owner.sections.length
  );

  useEffect(() => {
    const currentSectionsLength = data.owner.sections.length;

    if (isFirstRender.current) {
      // This is the first render, do nothing but update the ref
      isFirstRender.current = false;
    } else {
      // This is a subsequent render, execute the desired function
      // This uses state to track the previous length of sections while
      // avoiding a reset when reloading the page
      if (prevSectionsLength < currentSectionsLength) {
        scrollRightIntoView();
        setPrevSectionsLength(currentSectionsLength);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.owner.sections.length]);

  const [form, fields] = useForm({
    id: "add-section-form",
    constraint: getFieldsetConstraint(AddSectionFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: AddSectionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const [editSectionForm, editSectionFields] = useForm({
    id: "edit-section-form",
    constraint: getFieldsetConstraint(EditSectionFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EditSectionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  const [editTaskDescriptionForm, editTaskDescriptionFields] = useForm({
    id: "edit-task-description-form",
    constraint: getFieldsetConstraint(EditTaskDescriptionFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: EditTaskDescriptionFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div
      className="flex flex-row items-center overflow-x-auto w-screen mb-36 mr-8"
      ref={projectPageRef}
    >
      <div className="flex flex-row pt-6 px-5 w-full">
        {data.owner.sections.map((section, index) => (
          <div key={section.id} className="mr-4 w-[274px]">
            <div className="flex flex-row justify-between font-semibold h-10 w-64">
              {/* NOTE to add: Use state to set title to "Untitled section" if title is empty */}
              {editSectionFormIndex === index ? (
                <editSectionFetcher.Form
                  {...editSectionForm.props}
                  method="PUT"
                  action="/section-edit"
                  ref={editSectionTitleRefs[index]}
                  onSubmit={() => {
                    setEditSectionFormIndex(null);
                  }}
                  onBlur={() => {
                    if (editSectionTitleRefs[index].current?.value !== "") {
                      editSectionFetcher.submit(
                        editSectionTitleRefs[index].current
                      );
                    }
                    setEditSectionFormIndex(null);
                    editSectionTitleRefs[index].current?.reset();
                  }}
                  className="w-64"
                >
                  <AuthenticityTokenInput />
                  <input
                    ref={editSectionInputRef}
                    type="text"
                    {...conform.input(editSectionFields.title)}
                    className="max-w-54 overflow-hidden mb-1.5 text-base px-2 h-8 font-medium border-transparent hover:border-input focus:border-input transition"
                    defaultValue={section.title}
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setEditSectionFormIndex(null);
                      }
                    }}
                  />
                  <input
                    {...conform.input(editSectionFields.ownerId, {
                      type: "hidden",
                    })}
                    value={data.owner.id}
                  />
                  <input
                    {...conform.input(editSectionFields.sectionId, {
                      type: "hidden",
                    })}
                    value={section.id}
                  />
                  <input
                    {...conform.input(editSectionFields.index, {
                      type: "hidden",
                    })}
                    value={index}
                  />
                </editSectionFetcher.Form>
              ) : (
                <div
                  className="font-semibold pl-2 h-8 w-52 overflow-hidden hover:bg-gray-50 hover:cursor-pointer rounded-lg"
                  onClick={() => {
                    flushSync(() => {
                      setEditSectionFormIndex(index);
                    });
                    editSectionInputRef.current?.select();
                  }}
                >
                  {/* NOTE: Add optimistic update for section title edit */}
                  <div>
                    {editSectionFetcher.state !== "idle" &&
                    Number(editSectionFetcher.formData?.get("index")) === index
                      ? editSectionFetcher.formData?.get("title")?.toString()
                      : section.title}
                  </div>
                </div>
              )}

              <SectionDropdown sectionId={section.id} />
            </div>
            <div
              ref={sectionBodyRefs[index]}
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
                  {/* Render stand-in add task button while optimisticly deleting task. 
                      This avoids unsynchronized updating of UI while deleting task.
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
                      sectionRef={sectionBodyRefs[index]}
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
          className="w-[274px] hover:cursor-pointer pr-1"
          onClick={() => {
            flushSync(() => {
              setAddSectionCreateFormIsOpen(true);
            });
            addSectionInputRef.current?.select();
          }}
        >
          {addSectionCreateFormIsOpen ? (
            <addSectionFetcher.Form
              {...form.props}
              method="POST"
              action="/section-create"
              ref={addSectionRef}
              onSubmit={() => {
                setAddSectionCreateFormIsOpen(false);
              }}
              onBlur={() => {
                if (addSectionRef.current?.value !== "") {
                  addSectionFetcher.submit(addSectionRef.current);
                }
                addSectionRef.current?.reset();
              }}
            >
              <AuthenticityTokenInput />
              <input
                ref={addSectionInputRef}
                type="text"
                {...conform.input(fields.title)}
                className="w-64 mb-2.5 text-base px-2 h-8 font-medium border-transparent hover:border-input focus:border-input transition"
                placeholder="Enter section title..."
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setAddSectionCreateFormIsOpen(false);
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
            <div className="font-semibold mb-2.5 pl-2 h-8 w-64 hover:bg-gray-50 hover:cursor-pointer rounded-lg">
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
                  {/* NOTE: Move SVG to separate file */}
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
                  {/* NOTE: Move SVG to separate file */}
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
            <div className="border border-gray-300 hover:border-gray-400 rounded-lg h-96 w-full  hover:cursor-text cursor">
              {editingTaskDescriptionId ? (
                <editTaskDescriptionFetcher.Form
                  {...editTaskDescriptionForm.props}
                  method="PUT"
                  action="/task-edit"
                  ref={editTaskDescriptionRef}
                  onSubmit={() => {
                    setEditingTaskDescriptionId(null);
                  }}
                  onBlur={() => {
                    editTaskDescriptionFetcher.submit(
                      editTaskDescriptionRef.current
                    );
                    setTaskModalData({
                      ...taskModalData,
                      description: editTaskDescriptionInputRef.current?.value,
                    });

                    setEditingTaskDescriptionId(null);
                    editTaskDescriptionRef.current?.reset();
                  }}
                  className="h-full w-full "
                >
                  <AuthenticityTokenInput />
                  <textarea
                    ref={editTaskDescriptionInputRef}
                    {...conform.input(editTaskDescriptionFields.description)}
                    className="w-full h-full text-base p-4 border-transparent hover:border-input focus:border-input transition bg-gray-100 outline-none rounded-lg resize-none"
                    placeholder={
                      taskModalData.description
                        ? undefined
                        : "What is this task about?"
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setEditingTaskDescriptionId(null);
                      }
                    }}
                  >
                    {taskModalData.description}
                  </textarea>
                  <input
                    {...conform.input(editTaskDescriptionFields.ownerId, {
                      type: "hidden",
                    })}
                    value={data.owner.id}
                  />
                  <input
                    {...conform.input(editTaskDescriptionFields.taskId, {
                      type: "hidden",
                    })}
                    value={taskModalData.id}
                  />
                </editTaskDescriptionFetcher.Form>
              ) : (
                <div
                  className="h-full w-full p-4 text-base"
                  onClick={() => {
                    flushSync(() => {
                      setEditingTaskDescriptionId(taskModalData.id);
                    });
                    editTaskDescriptionInputRef.current?.select();
                  }}
                >
                  {/* NOTE: Add optimistic update for Task title edit */}
                  {editTaskDescriptionFetcher.state !== "idle" ? (
                    <div>
                      {editTaskDescriptionFetcher.formData
                        ?.get("description")
                        ?.toString()}
                    </div>
                  ) : (
                    <div
                      className={`${
                        taskModalData.description
                          ? "text-gray-600"
                          : "text-gray-400"
                      }`}
                    >
                      {taskModalData.description || "What is this task about?"}
                    </div>
                  )}
                </div>
              )}
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
