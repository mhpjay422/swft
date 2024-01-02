import { requireUserId } from "#app/utils/auth.server.ts";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { parse } from "@conform-to/zod";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { CSRFError } from "remix-utils/csrf/server";
import { EditTaskTitleFormSchema } from "../users+/$username_+/project.$projectId.index.tsx";

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

  const submission = parse(formData, {
    schema: EditTaskTitleFormSchema,
  });

  if (
    (submission.value?.title !== "" && !submission.value?.title) ||
    submission.intent !== "submit"
  ) {
    return json({ status: "idle", submission } as const);
  }

  if (!submission.value?.taskId) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { taskId, title } = submission.value;

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
      title,
    },
  });

  return json({ status: "success", submission } as const, {
    status: 200,
  });
}
