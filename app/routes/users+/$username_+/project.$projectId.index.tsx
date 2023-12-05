import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { type DataFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect, useRef, type RefObject } from "react";

const prisma = prismaClient;

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

const useClickOutside = (
  ref: RefObject<HTMLElement>,
  onClickOutside: (event: MouseEvent) => void
) => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClickOutside(event);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, onClickOutside]);
};

export async function loader({ request, params }: DataFunctionArgs) {
  const owner = await prisma.user.findFirst({
    select: {
      id: true,
      name: true,
      username: true,
      sections: {
        select: {
          id: true,
          title: true,
        },
      },
      tasks: true,
    },
    where: { username: params.username },
  });

  invariantResponse(owner, "Owner not found", { status: 404 });

  return json({ owner, projectId: params.projectId });
}

export async function action({ request, params }: DataFunctionArgs) {
  return json({});
}

export default function UsersProjectDetailPage() {
  const data = useLoaderData<typeof loader>();
  const [isTaskModalOpenAndData, setIsTaskModalOpenAndData] = useState<
    [boolean, Task]
  >([false, null]);
  const wrapperRef = useRef(null);
  const handleOutsideClick = () => {
    setIsTaskModalOpenAndData([false, null]);
  };

  useClickOutside(wrapperRef, handleOutsideClick);

  return (
    <div className="flex flex-grow flex-col items-center mb-32">
      <div className="flex flex-row py-6 px-5 mt-10">
        {data.owner.sections.map((section) => (
          <ul key={section.id} className="mr-6 w-64">
            <div className="font-semibold mb-2">{section.title}</div>
            {data.owner.tasks.map((task) => (
              <div
                key={task.id}
                className="h-28 w-64 p-4 border border-gray-200 hover:border-gray-400 hover:cursor-pointer rounded-lg mb-2"
                onClick={() => setIsTaskModalOpenAndData([true, task])}
              >
                {task.title}
              </div>
            ))}
          </ul>
        ))}
      </div>
      {isTaskModalOpenAndData[0] && isTaskModalOpenAndData[1] !== null && (
        <div className="absolute h-screen w-screen top-0 left-0 bg-black/[.60] text-white overflow-scroll">
          <div
            ref={wrapperRef}
            id="task-modal"
            className="flex flex-col bg-zinc-100 opacity-100 text-black flex-grow h-full w-[50%] p-4 mt-16 mb-16 mx-auto rounded-xl border border-gray-200"
          >
            <div>Title: {isTaskModalOpenAndData[1].title}</div>
            <div>
              Completed: {isTaskModalOpenAndData[1].completed ? "Yes" : "No"}
            </div>
            <div>Description: {isTaskModalOpenAndData[1].description}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
