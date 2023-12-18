import { redirect } from "@remix-run/node";
import { authSessionStorage } from "#app/utils/session.server.ts";

export async function loader() {
  return redirect("/");
}

// You do not need the cookie here to logout. getSession() will still get the
// session and we will destroy the session in the redirect.
export async function action() {
  const cookieSession = await authSessionStorage.getSession();

  return redirect("/login", {
    headers: {
      "set-cookie": await authSessionStorage.destroySession(cookieSession),
    },
  });
}
