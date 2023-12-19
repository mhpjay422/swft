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
import { safeRedirect } from "remix-utils/safe-redirect";
import { Form, useActionData, Link, useSearchParams } from "@remix-run/react";
import {
  bcrypt,
  getSessionExpirationDate,
  redirectIfAlreadyLoggedIn,
} from "#app/utils/auth.server.ts";
import { EmailSchema, PasswordSchema } from "#app/utils/zod.schemas.ts";
import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { authSessionStorage } from "#app/utils/session.server.ts";
import prismaClient from "#app/utils/db.server.ts";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { csrf } from "#app/utils/csrf.server.ts";
import { CSRFError } from "remix-utils/csrf/server";
import { CheckboxField, ErrorList } from "#app/utils/forms.tsx";
import { useIsSubmitting } from "#app/hooks/useIsSubmitting.ts";

const LoginFormSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  redirectTo: z.string().optional(),
  remember: z.boolean().optional(),
});

export async function loader({ request }: DataFunctionArgs) {
  await redirectIfAlreadyLoggedIn(request);
  return json({});
}

export async function action({ request }: DataFunctionArgs) {
  const prisma = prismaClient;
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
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, user: null };

        const userWithPassword = await prisma.user.findUnique({
          select: {
            id: true,
            username: true,
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
        return {
          ...data,
          user: {
            id: userWithPassword.id,
            username: userWithPassword.username,
          },
        };
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

  const { user, remember, redirectTo } = submission.value;

  const cookieSession = await authSessionStorage.getSession(
    request.headers.get("Cookie")
  );
  cookieSession.set("userId", user.id);

  const redirectUrl = redirectTo ?? `/users/${user.username}`;

  return redirect(safeRedirect(redirectUrl), {
    headers: {
      "set-cookie": await authSessionStorage.commitSession(cookieSession, {
        expires: remember ? getSessionExpirationDate() : undefined,
      }),
    },
  });
}

const useDynamicId = (id: string | undefined) => {
  const uniqueId = useId();
  return id ?? uniqueId;
};

export default function LoginPage() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [form, fields] = useForm({
    id: "login-form",
    constraint: getFieldsetConstraint(LoginFormSchema),
    defaultValue: { redirectTo },
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

        <Form replace method="POST" className="mt-8 space-y-2" {...form.props}>
          <AuthenticityTokenInput />
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
          <ErrorList id={`error-${useId()}`} errors={fields.email.errors} />
          <div>Password</div>
          <div className="bg-white block w-full appearance-none rounded-md border border-gray-300 text-gray-900 sm:text-sm">
            <label htmlFor={fields.password.id} />
            <input
              className="h-full w-full px-3 py-3 rounded-md"
              {...conform.input(fields.password)}
            />
            <div></div>
          </div>
          <ErrorList id={`error-${useId()}`} errors={fields.password.errors} />
          <CheckboxField
            labelProps={{
              htmlFor: fields.remember.id,
              children: "Remember me",
            }}
            buttonProps={conform.input(fields.remember, {
              type: "checkbox",
            })}
            errors={fields.remember.errors}
          />

          <input {...conform.input(fields.redirectTo, { type: "hidden" })} />

          <ErrorList id={`error-${useId()}`} errors={form.errors} />
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
            <Link
              to={
                redirectTo
                  ? `/signup?${encodeURIComponent(redirectTo)}`
                  : "/signup"
              }
              className="text-blue-700 underline"
            >
              {" "}
              Create an account
            </Link>
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
