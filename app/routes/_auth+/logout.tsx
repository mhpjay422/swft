import { redirect } from "@remix-run/node";
import { sessionStorage } from "#app/utils/session.server.ts";

export async function loader() {
  return redirect("/");
}

// You do not need the cookie here to logout. getSession() will still get the
// session and we will destroy the session in the redirect.
export async function action() {
  const cookieSession = await sessionStorage.getSession();

  return redirect("/", {
    headers: {
      "set-cookie": await sessionStorage.destroySession(cookieSession),
    },
  });
}
