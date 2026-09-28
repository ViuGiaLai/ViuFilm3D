import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  resolveAdminCookieOptions,
} from "@/lib/server/admin-session";
import {
  clearViewerSession,
  clearViewerSessionOnResponse,
} from "@/lib/server/viewer-session";

export async function POST(request: Request) {
  await clearViewerSession(request);
  const response = NextResponse.json({ data: null });
  const adminOpts = resolveAdminCookieOptions(request);
  response.cookies.set(ADMIN_COOKIE, "", {
    ...adminOpts,
    maxAge: 0,
  });
  clearViewerSessionOnResponse(response, request);
  return response;
}
