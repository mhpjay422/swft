import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  type DataFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { z } from "zod";
import { sessionStorage } from "~/utils/session.server";
import { EmailSchema, NameSchema, PasswordSchema } from "~/utils/zod.schemas";
import prismClient from "~/utils/db.server";

const prisma = prismClient;

const SignupFormSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

export async function action({ request }: DataFunctionArgs) {}

export const meta: MetaFunction = () => {
  return [{ title: "Signup for SWFT" }];
};

export default function SignupRoute() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getFieldsetConstraint(SignupFormSchema),
    // lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: SignupFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
      Hello World
    </div>
  );
}
