import { NextResponse } from "next/server";
import {
  createSupabaseAdminClient,
  createSupabaseReadClient,
} from "@/lib/supabase/server";
import {
  attachViewerSession,
  clearViewerSession,
  clearViewerSessionOnResponse,
  findViewerProfile,
  setViewerSession,
} from "@/lib/server/viewer-session";
import {
  ADMIN_COOKIE,
  createAdminToken,
  resolveAdminCookieOptions,
} from "@/lib/server/admin-session";
import {
  getAdminCredentials,
  isAdminAuthConfigured,
} from "@/lib/server/env";
import { getAdminProfile } from "@/lib/server/social-identity";
import { apiError } from "@/lib/server/api-response";
import type { Session } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { session?: Session };
    const session = body?.session;

    if (!session || !session.access_token || !session.user) {
      return NextResponse.json(
        { error: "Phiên đăng nhập OAuth không hợp lệ." },
        { status: 400 },
      );
    }

    // Verify access token with Supabase Auth to ensure authenticity
    const readClient = createSupabaseReadClient();
    const { data: authData, error: authError } =
      await readClient.auth.getUser(session.access_token);

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Xác thực token người dùng thất bại." },
        { status: 401 },
      );
    }

    const authUser = authData.user;
    const email = String(authUser.email || "").toLowerCase();

    // Check if logging in as Admin
    if (isAdminAuthConfigured()) {
      const { email: adminEmail } = getAdminCredentials();
      if (email === adminEmail) {
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

    let viewer = await findViewerProfile(authUser.id);

    // If app_users row doesn't exist yet, insert or link it
    if (!viewer) {
      const db = createSupabaseAdminClient();
      const meta = authUser.user_metadata || {};
      const displayName = String(
        meta.full_name ||
          meta.name ||
          authUser.email?.split("@")[0] ||
          "Đạo Hữu",
      )
        .trim()
        .slice(0, 100);

      // Check if user already exists with this email
      const { data: existingUser } = await db
        .from("app_users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      const now = new Date().toISOString();

      if (existingUser) {
        // Link existing record with new auth_user_id
        await db
          .from("app_users")
          .update({
            auth_user_id: authUser.id,
            last_active: now,
          })
          .eq("id", existingUser.id);
      } else {
        // Create new viewer record
        const insertRes = await db.from("app_users").insert({
          auth_user_id: authUser.id,
          name: displayName || "Đạo Hữu",
          email,
          role: "user",
          status: "Đang hoạt động",
          plan: "Miễn phí",
          avatar_id: "sample-0",
          joined_at: now.slice(0, 10),
          last_active: now,
          watches: 0,
        });

        if (insertRes.error && insertRes.error.code === "23505") {
          await db
            .from("app_users")
            .update({
              auth_user_id: authUser.id,
              last_active: now,
            })
            .eq("email", email);
        }
      }

      viewer = await findViewerProfile(authUser.id);
    }

    if (!viewer) {
      return NextResponse.json(
        { error: "Không thể khởi tạo hồ sơ người dùng." },
        { status: 500 },
      );
    }

    await setViewerSession(session, request);
    const response = NextResponse.json({ data: viewer.account });
    attachViewerSession(response, session, request);

    // Clear admin cookie to avoid session overlap
    const adminOpts = resolveAdminCookieOptions(request);
    response.cookies.set(ADMIN_COOKIE, "", {
      ...adminOpts,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return apiError(error, "Xử lý phiên đăng nhập OAuth thất bại.");
  }
}
