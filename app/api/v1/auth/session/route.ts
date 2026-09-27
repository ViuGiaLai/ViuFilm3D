import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/server/admin-session";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiError } from "@/lib/server/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (session) {
    return NextResponse.json({
      data: {
        email: session.email,
        name: "Quản trị viên",
        role: session.role,
      },
    });
  }

  try {
    return NextResponse.json({
      data: (await getViewerIdentity())?.account ?? null,
    });
  } catch (error) {
    return apiError(error, "Không thể kiểm tra phiên đăng nhập.");
  }
}
