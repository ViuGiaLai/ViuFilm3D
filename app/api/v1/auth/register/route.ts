import { createSupabaseReadClient } from "@/lib/supabase/server";
import { adminRepository } from "@/lib/server/admin-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { ValidationError } from "@/lib/server/errors";
import { getBackendStatus } from "@/lib/server/backend-status";

export async function POST(request: Request) {
  try {
    const settings = await adminRepository.getSettings();
    if (!settings?.allowRegistration) {
      return apiProblem("Đăng ký tài khoản đang tạm đóng.", 403);
    }
    const backend = await getBackendStatus();
    if (backend.viewerFeatures !== "connected") {
      return apiProblem(
        "Tính năng tài khoản chưa sẵn sàng. Vui lòng liên hệ quản trị viên.",
        503,
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (name.length < 2 || name.length > 100) {
      throw new ValidationError("Tên hiển thị cần từ 2 đến 100 ký tự.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new ValidationError("Email không hợp lệ.");
    }
    if (password.length < 8 || password.length > 128) {
      throw new ValidationError("Mật khẩu cần từ 8 đến 128 ký tự.");
    }

    const { data, error } = await createSupabaseReadClient().auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      return apiProblem(
        "Không thể tạo tài khoản lúc này. Vui lòng thử lại sau.",
        400,
      );
    }

    // Supabase may require email verification. Never expose whether an email
    // already exists in Auth; the user can sign in after confirmation.
    return apiData({ confirmationRequired: !data.session }, { status: 201 });
  } catch (error) {
    return apiError(error, "Không thể tạo tài khoản.");
  }
}
