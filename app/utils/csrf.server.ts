import { createCookie } from "@remix-run/node";
import { CSRF } from "remix-utils/csrf/server";

const cookie = createCookie("csrf", {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  // NOTE: Need to add zod validations for ENV variables
  secrets: process.env.SESSION_SECRET?.split(","),
});

export const csrf = new CSRF({ cookie });
