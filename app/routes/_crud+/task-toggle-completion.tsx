import { requireUserId } from "#app/utils/auth.server.ts";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { parse } from "@conform-to/zod";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { CSRFError } from "remix-utils/csrf/server";
import { ToggleTaskCompletionFormSchema } from "../../components/tasks/task-card.tsx";

const prisma = prismaClient;

export async function action({ request }: DataFunctionArgs) {
  const userId = await requireUserId(request);
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
      ToggleTaskCompletionFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, completed: null };
        return {
          ...data,
          completed: data.completed === "true",
        };
      }),
    async: true,
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }

  console.log("sub", submission);

  if (!submission.value?.taskId || submission.value?.completed === undefined) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { taskId, completed } = submission.value;

  const task = await prisma.task.findFirst({
    select: {
      id: true,
      ownerId: true,
      owner: { select: { username: true } },
    },
    where: { id: taskId },
  });
  invariantResponse(task, "Not found", { status: 404 });

  const isOwner = task.ownerId === userId;

  if (!isOwner) {
    throw json(
      {
        error: "Unauthorized",
        message: `Unauthorized to edit task ${task.id}`,
      },
      { status: 403 }
    );
  }

  await prisma.task.update({
    where: {
      id: taskId,
    },
    data: {
      completed: !completed,
    },
  });

  return json({ status: "success", submission } as const, {
    status: 200,
  });
}
