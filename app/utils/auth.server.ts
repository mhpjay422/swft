import bcrypt from "bcryptjs";
import prismaClient from "#app/utils/db.server.ts";
import { redirect } from "@remix-run/node";
import { safeRedirect } from "remix-utils/safe-redirect";
import { authSessionStorage } from "./session.server.ts";

const prisma = prismaClient;

export { bcrypt };

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days

export function getSessionExpirationDate() {
  return new Date(Date.now() + SESSION_EXPIRATION_TIME);
}

export async function getUserId(request: Request) {
  const cookieSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const userId = cookieSession.get("userId");
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { id: userId },
  });
  if (!user) {
    throw await logout({ request });
  }
  return user.id;
}

export async function requireUserId(request: Request) {
  const userId = await getUserId(request);
  if (!userId) {
    throw redirect("/login");
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUnique({
    select: { id: true, username: true },
    where: { id: userId },
  });
  if (!user) {
    throw await logout({ request });
  }
  return user;
}

export async function redirectIfAlreadyLoggedIn(request: Request) {
  const userId = await getUserId(request);
  if (userId) {
    throw redirect("/");
  }
}

export async function logout({
  request,
  redirectTo = "/",
}: {
  request: Request;
  redirectTo?: string;
}) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  throw redirect(safeRedirect(redirectTo), {
    headers: {
      "set-cookie": await sessionStorage.destroySession(cookieSession),
    },
  });
}
