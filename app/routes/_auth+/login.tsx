import {
  type DataFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { DynamicErrorBoundary } from "~/components/error-boundary";

export async function loader({ request }: DataFunctionArgs) {
  return json({});
}

export async function action({ request }: DataFunctionArgs) {}

export default function LoginPage() {
  const actionData = useActionData<typeof action>();

  // const [form, fields] = useForm({
  //   id: "login-form",
  //   constraint: getFieldsetConstraint(LoginFormSchema),
  //   defaultValue: { redirectTo },
  //   lastSubmission: actionData?.submission,
  //   onValidate({ formData }) {
  //     return parse(formData, { schema: LoginFormSchema });
  //   },
  //   shouldRevalidate: "onBlur",
  // });

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-white h-screen">
      hello
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [{ title: "Login to SWFT" }];
};

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
