import { useRouteLoaderData } from "@remix-run/react";

import { type loader as rootLoader } from "../../app/root";

export function useLoggedInUser() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  return data?.user ?? null;
}
