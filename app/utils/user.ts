import { useRouteLoaderData } from "@remix-run/react";

// Commented out the import statement
// import { type loader as rootLoader } from "#app/root";
import { type loader as rootLoader } from "#app/root.tsx";

export function useLoggedInUser() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  return data?.user ?? null;
}
