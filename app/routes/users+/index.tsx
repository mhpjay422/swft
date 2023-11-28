import { DynamicErrorBoundary } from "#app/components/error-boundary.tsx";
import { type DataFunctionArgs, json } from "@remix-run/node";

export async function loader({ params }: DataFunctionArgs) {
  return json({});
}

export async function action({ request }: DataFunctionArgs) {
  return json({});
}

export default function UsersIndexPage() {
  return (
    <div className="flex flex-col mx-96 w-auto h-96 mt-20 border border-gray-200 hover:border-gray-300 rounded-lg">
      <div className="p-8 ">Search for a user</div>
      {/* NOTE: Add a search bar here */}
    </div>
  );
}

export function ErrorBoundary() {
  return <DynamicErrorBoundary />;
}
