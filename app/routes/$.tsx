import { Link, useLocation } from "@remix-run/react";
import { DynamicErrorBoundary } from "../components/error-boundary";

export async function loader() {
  throw new Response("Not found", { status: 404 });
}

export default function NotFound() {
  return <ErrorBoundary />;
}

export function ErrorBoundary() {
  const location = useLocation();
  return (
    <DynamicErrorBoundary
      statusHandlers={{
        404: () => (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h1>Sorry, we couldn't find the page you're looking for</h1>
              <pre className="text-body-lg whitespace-pre-wrap break-all">
                {location.pathname}
              </pre>
            </div>
            <Link to="/" className="text-body-md underline">
              Back to home
            </Link>
          </div>
        ),
      }}
    />
  );
}
