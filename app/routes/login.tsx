import {
  type DataFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { z } from "zod";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { useId } from "react";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { DynamicErrorBoundary } from "~/components/error-boundary";
import { PasswordSchema, EmailSchema } from "../utils/zod.schemas";

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export async function loader({ request }: DataFunctionArgs) {
  return json({});
}

export async function action({ request }: DataFunctionArgs) {}

const useDynamicId = (id: string | undefined) => {
  const uniqueId = useId();
  return id ?? uniqueId;
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getFieldsetConstraint(LoginFormSchema),
    // lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="flex-grow flex flex-col w-full px-4 sm:px-6 lg:px-8 bg-gray-50 pt-60">
      <div className="w-full max-w-md space-y-8 mx-auto">
        <div className="relative flex flex-col w-full">
          <p className="mt-4 text-gray-500 text-center text-md">
            Sign in to SWFT
          </p>
        </div>

        <Form method="POST" className="mt-8 space-y-2">
          <div>
            <div>Email</div>
            <div className="bg-white block w-full appearance-none rounded-md border border-gray-300 text-gray-900 sm:text-sm">
              <label htmlFor={useDynamicId(fields.email.id)} />
              <input
                className="h-full w-full px-3 py-3 rounded-md"
                autoFocus
                {...conform.input(fields.email)}
              />
              <div></div>
            </div>
            <ul
              id={fields.email.errorId}
              className="min-h-[32px] px-4 pb-3 pt-1"
            >
              {fields.email.errors
                ? fields?.email?.errors.map((error, i) => (
                    <li key={i} className="text-[10px] text-red-600">
                      {error}
                    </li>
                  ))
                : null}
            </ul>
            <div>Password</div>
            <div className="bg-white block w-full appearance-none rounded-md border border-gray-300 text-gray-900 sm:text-sm">
              <label htmlFor={fields.password.id} />
              <input
                className="h-full w-full px-3 py-3 rounded-md"
                {...conform.input(fields.password)}
              />
              <div></div>
            </div>
            <ul
              id={fields.password.errorId}
              className="min-h-[32px] px-4 pb-3 pt-1"
            >
              {fields.password.errors
                ? fields?.password?.errors.map((error, i) => (
                    <li key={i} className="text-[10px] text-red-600">
                      {error}
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </Form>
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: "Login to SWFT" }];
};

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
