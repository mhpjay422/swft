import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  type DataFunctionArgs,
  type MetaFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useFormAction,
  useNavigation,
} from "@remix-run/react";
import { z } from "zod";
import { bcrypt } from "~/utils/auth.server";
import { sessionStorage } from "~/utils/session.server";
import { EmailSchema, NameSchema, PasswordSchema } from "~/utils/zod.schemas";
import prismClient from "~/utils/db.server";
import { useId } from "react";
import { DynamicErrorBoundary } from "~/components/error-boundary";

const prisma = prismClient;

const SignupFormSchema = z.object({
  name: NameSchema,
  email: EmailSchema,
  password: PasswordSchema,
});

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

export async function action({ request }: DataFunctionArgs) {
  const formData = await request.formData();
  const submission = await parse(formData, {
    schema: SignupFormSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (existingUser) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A user already exists with this email address",
        });

        return z.NEVER;
      }
    }).transform(async (data) => {
      const { email, name, password } = data;

      const user = await prisma.user.create({
        select: { id: true },
        data: {
          email: email.toLowerCase(),
          name,
          password: {
            create: {
              hash: await bcrypt.hash(password, 10),
            },
          },
        },
      });

      return { ...data, user };
    }),
    async: true,
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }

  if (!submission.value?.user) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { user } = submission.value;

  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  cookieSession.set("userId", user.id);

  return redirect("/", {
    headers: {
      "set-cookie": await sessionStorage.commitSession(cookieSession),
    },
  });
}

export const meta: MetaFunction = () => {
  return [{ title: "Signup for SWFT" }];
};

export default function SignupRoute() {
  const actionData = useActionData<typeof action>();

  const [form, fields] = useForm({
    id: "signup-form",
    constraint: getFieldsetConstraint(SignupFormSchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: SignupFormSchema });
    },
    shouldRevalidate: "onBlur",
  });

  return (
    <div className="flex-grow flex flex-col w-full px-4 sm:px-6 lg:px-8 bg-gray-50 pt-24">
      <div className="w-full max-w-md space-y-8 mx-auto">
        <div className="relative flex flex-col w-full">
          <p className="mt-4 text-gray-700 text-4xl font-semibold">
            Create your account
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
            <div>Name</div>
            <div className="bg-white block w-full appearance-none rounded-md border border-gray-300 text-gray-900 sm:text-sm">
              <label htmlFor={useDynamicId(fields.name.id)} />
              <input
                className="h-full w-full px-3 py-3 rounded-md"
                {...conform.input(fields.name)}
              />
              <div></div>
            </div>
            <ul
              id={fields.name.errorId}
              className="min-h-[32px] px-4 pb-3 pt-1"
            >
              {fields.name.errors
                ? fields?.name?.errors.map((error, i) => (
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
              {useIsSubmitting() ? "Submitting" : "Sign up"}
            </button>
            <div className="flex items-center justify-center gap-2 pt-6">
              Already have an account?
              <Link to="/login" className="text-blue-700 underline">
                {" "}
                Sign in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}