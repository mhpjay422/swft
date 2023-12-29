import { requireUserId } from "#app/utils/auth.server.ts";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { invariantResponse } from "#app/utils/misc.tsx";
import { parse } from "@conform-to/zod";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { CSRFError } from "remix-utils/csrf/server";
import { z } from "zod";

const prisma = prismaClient;

const DeleteSectionFormSchema = z.object({
  sectionId: z.string(),
});

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
    schema: DeleteSectionFormSchema,
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }
  if (!submission.value?.sectionId) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { sectionId } = submission.value;

  const section = await prisma.section.findFirst({
    select: {
      id: true,
      ownerId: true,
      owner: { select: { username: true } },
    },
    where: { id: sectionId },
  });
  invariantResponse(section, "Not found", { status: 404 });

  const isOwner = section.ownerId === userId;

  if (!isOwner) {
    throw json(
      {
        error: "Unauthorized",
        message: `Unauthorized to delete section ${section.id}`,
      },
      { status: 403 }
    );
  }

  await prisma.section.delete({ where: { id: section.id } });

  return json({ status: "success", submission } as const, { status: 200 });
}
