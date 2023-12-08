import bcrypt from "bcryptjs";
import prismaClient from "#app/utils/db.server.ts";

const prisma = prismaClient;

export { bcrypt };

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30; // 30 days

export function getSessionExpirationDate() {
  return new Date(Date.now() + SESSION_EXPIRATION_TIME);
}

export async function getUserId(request: Request) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const userId = cookieSession.get("userId");
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    select: { id: true },
    where: { id: userId },
  });

  return user?.id;
}
