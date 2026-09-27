import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

export async function PATCH(request: Request) {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const body = (await request.json()) as { name?: unknown };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (name.length < 2 || name.length > 100) {
      return apiProblem("Tên hiển thị cần từ 2 đến 100 ký tự.", 400);
    }
    const { data, error } = await createSupabaseAdminClient()
      .from("app_users")
      .update({ name })
      .eq("id", viewer.id)
      .eq("auth_user_id", viewer.authUserId)
      .select("email,name")
      .single();
    if (error) throw error;
    return apiData({ email: data.email, name: data.name, role: "user" });
  } catch (error) {
    return apiError(error, "Không thể cập nhật hồ sơ.");
  }
}
