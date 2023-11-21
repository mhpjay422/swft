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
  Link,
} from "@remix-run/react";
import { DynamicErrorBoundary } from "~/components/error-boundary";
import { PasswordSchema, EmailSchema } from "../../utils/zod.schemas";
import { sessionStorage } from "../../utils/session.server";
import prismaClient from "~/utils/db.server";
import { bcrypt } from "~/utils/auth.server";

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export async function loader({ request }: DataFunctionArgs) {
  return json({});
}

export async function action({ request }: DataFunctionArgs) {
  const prisma = prismaClient;
  const formData = await request.formData();

  const submission = await parse(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, user: null };

        const userWithPassword = await prisma.user.findUnique({
          select: {
            id: true,
            password: {
              select: {
                hash: true,
              },
            },
          },
          where: { email: data.email },
        });

        // Ensures there is a password to compare against for bcrypt
        if (!userWithPassword || !userWithPassword.password) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        const isValidPassword = await bcrypt.compare(
          data.password,
          userWithPassword?.password?.hash
        );

        if (!isValidPassword) {
          ctx.addIssue({
            code: "custom",
            message: "Invalid username or password",
          });
          return z.NEVER;
        }

        // NOTE: Do not return the password hash to the client
        return { ...data, user: { id: userWithPassword.id } };
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
    <div className="flex-grow flex flex-col w-full px-4 sm:px-6 lg:px-8 bg-gray-50 pt-28">
      <div className="w-full max-w-md space-y-8 mx-auto">
        <div className="relative flex flex-col w-full">
          <p className="mt-4 text-gray-700 text-4xl font-semibold">Sign in</p>
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
            {form.errors.length > 0 ? (
              <ul id={form.errorId} className="flex flex-col gap-1">
                {form.errors.map((e) => (
                  <li key={e} className="text-[10px] text-red-600">
                    {e}
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              className={`${
                useIsSubmitting()
                  ? "bg-gray-400 hover:cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300"
              } relative block w-full appearance-none rounded-md border border-gray-400 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm mt-20 h-12`}
              type="submit"
              disabled={useIsSubmitting()}
            >
              {/* NOTE: FIX THIS */}
              {useIsSubmitting() ? "Submitting" : "Submit"}
            </button>
            <div className="flex items-center justify-center gap-2 pt-6">
              Dont have an account?
              <Link to="/signup" className="text-blue-700 underline">
                {" "}
                Create an account
              </Link>
            </div>
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
