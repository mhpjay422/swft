import {
  type DataFunctionArgs,
  type MetaFunction,
  json,
  redirect,
} from "@remix-run/node";
import { z } from "zod";
import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { useId } from "react";
import {
  Form,
  useActionData,
  useFormAction,
  useNavigation,
} from "@remix-run/react";
import { DynamicErrorBoundary } from "~/components/error-boundary";
import { PasswordSchema, EmailSchema } from "../utils/zod.schemas";
import { PrismaClient } from "@prisma/client";
import { sessionStorage } from "../utils/session.server";

const prisma = new PrismaClient();
const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export async function loader({ request }: DataFunctionArgs) {
  return json({});
}

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();

  const submission = await parse(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, user: null };

        const user = await prisma.user.findUnique({
          select: { id: true },
          where: { email: data.email },
        });
        if (!user) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        return { ...data, user };
      }),
    async: true,
  });

  delete submission.payload.password;

  if (submission.intent !== "submit") {
    // @ts-expect-error - conform should probably have support for doing this
    delete submission.value?.password;

    return json({ status: "idle", submission } as const);
  }

  if (!submission.value?.user) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { user } = submission.value;

  const cookieSession = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  cookieSession.set("userId", user.id);

  return redirect("/", {
    headers: {
      "set-cookie": await sessionStorage.commitSession(cookieSession),
    },
  });
}

const useDynamicId = (id: string | undefined) => {
  const uniqueId = useId();
  return id ?? uniqueId;
};

const useIsSubmitting = ({
  formAction,
  formMethod = "POST",
  state = "non-idle",
}: {
  formAction?: string;
  formMethod?: "POST" | "GET" | "PUT" | "PATCH" | "DELETE";
  state?: "submitting" | "loading" | "non-idle";
} = {}) => {
  const frmActn = useFormAction();
  const navigation = useNavigation();
  const isPendingState =
    state === "non-idle"
      ? navigation.state !== "idle"
      : navigation.state === state;
  return (
    isPendingState &&
    navigation.formAction === (formAction ?? frmActn) &&
    navigation.formMethod === formMethod
  );
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getFieldsetConstraint(LoginFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="flex-grow flex flex-col w-full px-4 sm:px-6 lg:px-8 bg-gray-50 pt-48">
      <div className="w-full max-w-md space-y-8 mx-auto">
        <div className="relative flex flex-col w-full">
          <p className="mt-4 text-gray-500 text-center text-md">
            Sign in to SWFT
          </p>
        </div>

        <Form method="POST" className="mt-8 space-y-2" {...form.props}>
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
            <button
              className={`${
                useIsSubmitting()
                  ? "bg-primary-dark hover:cursor-not-allowed"
                  : "bg-gray-200 hover:bg-primary-dark"
              } relative block w-full appearance-none rounded-md border border-gray-400 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm mt-20 h-12`}
              type="submit"
              disabled={useIsSubmitting()}
            >
              {/* NOTE: FIX THIS */}
              {useIsSubmitting() ? "Submitting" : "Submit"}
            </button>
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
