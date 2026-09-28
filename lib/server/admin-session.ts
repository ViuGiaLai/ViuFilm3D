import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAuthSecret } from "@/lib/server/env";

export const ADMIN_COOKIE = "viufilm3d_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type AdminSession = {
  email: string;
  role: "admin";
  expiresAt: number;
};

const sign = (payload: string) =>
  createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");

export function createAdminToken(email: string) {
  const session: AdminSession = {
    email,
    role: "admin",
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    if (!token) return null;
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;

    const expected = Buffer.from(sign(payload));
    const received = Buffer.from(signature);
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return null;
    }

    const session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AdminSession;

    return session.role === "admin" && session.expiresAt > Date.now()
      ? session
      : null;
  } catch {
    return null;
  }
}

export async function hasAdminSession() {
  return Boolean(await getAdminSession());
}

export function isRequestSecure(request?: Request): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  if (!request) return false;
  const proto =
    request.headers.get("x-forwarded-proto") ||
    request.headers.get("x-forwarded-protocol");
  if (proto === "https") return true;
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveAdminCookieOptions(request?: Request) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isRequestSecure(request),
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  };
}

export const adminCookieOptions = resolveAdminCookieOptions();
