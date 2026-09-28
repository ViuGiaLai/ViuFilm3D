import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import {
  ADMIN_COOKIE,
  createAdminToken,
  resolveAdminCookieOptions,
} from "@/lib/server/admin-session";
import { apiError } from "@/lib/server/api-response";
import { getAdminCredentials, isAdminAuthConfigured } from "@/lib/server/env";
import { createSupabaseReadClient } from "@/lib/supabase/server";
import {
  attachViewerSession,
  clearViewerSession,
  clearViewerSessionOnResponse,
  findViewerProfile,
  setViewerSession,
} from "@/lib/server/viewer-session";
import { getAdminProfile } from "@/lib/server/social-identity";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };
    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body.password ?? "");

    if (isAdminAuthConfigured()) {
      const { email: adminEmail, password: adminPassword } =
        getAdminCredentials();
      const suppliedPassword = Buffer.from(password);
      const expectedPassword = Buffer.from(adminPassword);
      const passwordMatches =
        suppliedPassword.length === expectedPassword.length &&
        timingSafeEqual(suppliedPassword, expectedPassword);

      if (email === adminEmail && passwordMatches) {
        const profile = await getAdminProfile(email);
        await clearViewerSession(request);
        const response = NextResponse.json({
          data: profile?.account ?? {
            email,
            name: "Quản trị viên",
            role: "admin",
          },
        });
        const opts = resolveAdminCookieOptions(request);
        response.cookies.set(ADMIN_COOKIE, createAdminToken(email), opts);
        clearViewerSessionOnResponse(response, request);
        return response;
      }
    }

    const { data, error } =
      await createSupabaseReadClient().auth.signInWithPassword({
        email,
        password,
      });
    if (error || !data.session) {
      return NextResponse.json(
        {
          error:
            "Email hoặc mật khẩu không chính xác, hoặc email chưa được xác nhận.",
        },
        { status: 401 },
      );
    }

    const viewer = await findViewerProfile(data.user.id);
    if (!viewer) {
      return NextResponse.json(
        { error: "Tài khoản chưa sẵn sàng hoặc đã bị khóa." },
        { status: 403 },
      );
    }
    await setViewerSession(data.session, request);
    const response = NextResponse.json({ data: viewer.account });
    attachViewerSession(response, data.session, request);
    const adminOpts = resolveAdminCookieOptions(request);
    response.cookies.set(ADMIN_COOKIE, "", {
      ...adminOpts,
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return apiError(error, "Yêu cầu đăng nhập không hợp lệ.");
  }
}
