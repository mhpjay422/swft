import {
  isRouteErrorResponse,
  useParams,
  useRouteError,
} from "@remix-run/react";
import { type ErrorResponse } from "@remix-run/router";

type StatusHandler = (info: {
  error: ErrorResponse;
  params: Record<string, string | undefined>;
}) => JSX.Element | null;

export function DynamicErrorBoundary({
  defaultStatusHandler = ({ error }) => (
    <p>
      {error.status} {error.data}
    </p>
  ),
  statusHandlers,
}: {
  defaultStatusHandler?: StatusHandler;
  statusHandlers?: Record<number, StatusHandler>;
}) {
  const error = useRouteError();
  const params = useParams();

  return (
    <div className="mx-auto flex h-full w-full items-center justify-center p-20 font-semibold bg-red-500">
      {isRouteErrorResponse(error)
        ? (statusHandlers?.[error.status] ?? defaultStatusHandler)({
            error,
            params,
          })
        : "There has been an unexpected error"}
    </div>
  );
}
