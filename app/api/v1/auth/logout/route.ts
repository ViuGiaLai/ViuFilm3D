import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions } from "@/lib/server/admin-session";
import { clearViewerSession } from "@/lib/server/viewer-session";

export async function POST() {
  await clearViewerSession();
  const response = NextResponse.json({ data: null });
  response.cookies.set(ADMIN_COOKIE, "", {
    ...adminCookieOptions,
    maxAge: 0,
  });
  return response;
}
