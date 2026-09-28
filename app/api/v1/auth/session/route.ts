import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/admin-session";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiError } from "@/lib/server/api-response";
import { getAdminProfile } from "@/lib/server/social-identity";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (session) {
    try {
      const profile = await getAdminProfile(session.email);
      return NextResponse.json({
        data: profile?.account ?? {
          email: session.email,
          name: "Quản trị viên",
          role: session.role,
        },
      });
    } catch (error) {
      return apiError(error, "Không thể kiểm tra phiên đăng nhập.");
    }
  }

  try {
    return NextResponse.json({
      data: (await getViewerIdentity())?.account ?? null,
    });
  } catch (error) {
    return apiError(error, "Không thể kiểm tra phiên đăng nhập.");
  }
}
