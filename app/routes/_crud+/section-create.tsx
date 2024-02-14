import { AddSectionFormSchema } from "#app/components/sections/add-section-form.tsx";
import { csrf } from "#app/utils/csrf.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { parse } from "@conform-to/zod";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { CSRFError } from "remix-utils/csrf/server";
import { z } from "zod";

const prisma = prismaClient;

export async function action({ request }: DataFunctionArgs) {
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
      AddSectionFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, section: null };

        if (!data.title || !data.ownerId || !data.projectId) {
          return;
        }

        const section = await prisma.section.create({
          data: {
            title: data.title,
            ownerId: data.ownerId,
            projectId: data.projectId,
          },
        });

        if (!section) {
          ctx.addIssue({
            code: "custom",
            message: "Unable to create section",
          });
          return z.NEVER;
        }

        return {
          ...data,
          section,
        };
      }),
    async: true,
  });

  if (submission.intent !== "submit" || !submission.value?.title) {
    return json({ status: "idle", submission } as const);
  }

  if (!submission.value?.section) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  return json({ status: "success", submission } as const, { status: 200 });
}
