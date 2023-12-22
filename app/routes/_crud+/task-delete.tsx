import { requireUserId } from "#app/utils/auth.server.ts";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { parse } from "@conform-to/zod";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { CSRFError } from "remix-utils/csrf/server";
import { z } from "zod";

const prisma = prismaClient;

const DeleteTaskFormSchema = z.object({
  taskId: z.string(),
});

export async function action({ request, params }: DataFunctionArgs) {
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
    schema: DeleteTaskFormSchema,
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }
  if (!submission.value?.taskId) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { taskId } = submission.value;

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
        message: `Unauthorized to delete task ${task.id}`,
      },
      { status: 403 }
    );
  }

  await prisma.task.delete({ where: { id: task.id } });

  return json({ status: "success", submission } as const, { status: 200 });
}
