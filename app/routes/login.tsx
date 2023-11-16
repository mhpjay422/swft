import {
  type DataFunctionArgs,
  type MetaFunction,
  json,
} from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { useState } from "react";
import { DynamicErrorBoundary } from "~/components/error-boundary";

export async function loader({ request }: DataFunctionArgs) {
  return json({});
}

export async function action({ request }: DataFunctionArgs) {}

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>("Sign in");

  const actionData = useActionData<typeof action>();

  return (
    <div className="flex-grow flex flex-col mb-[10%] items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
      <div className="w-full max-w-md space-y-8">
        <div className="relative flex flex-col w-full">
          <p className="mt-4 text-gray-500 text-center text-md">
            Sign in to SWFT
          </p>
        </div>

        <Form method="POST" className="mt-8 space-y-2">
          {/* NOTE: Add error handling */}
          <div className="">
            <div>Username</div>
            <div>
              <label htmlFor="email-address" className=""></label>
              <input className="bg-white relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-primary  sm:text-sm" />
            </div>
            <div className="mt-6">Password</div>
            <div>
              <label htmlFor="password" className=""></label>
              <input className="bg-white relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm" />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`${
                isSubmitting
                  ? "bg-primary-dark hover:cursor-not-allowed"
                  : "bg-gray-200 hover:bg-primary-dark"
              } relative block w-full appearance-none rounded-md border border-gray-400 px-3 py-2 text-gray-900 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm mt-20 h-12`}
            >
              {buttonText}
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
