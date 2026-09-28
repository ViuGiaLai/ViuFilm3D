import { getAdminSession } from "@/lib/server/admin-session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { parseSupportProfile } from "@/lib/admin-community";
import { avatarFrames } from "@/lib/avatar-frames";
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return apiProblem("Không có quyền hỗ trợ hồ sơ.", 401);
  try {
    const id = Number((await context.params).id);
    const body = await request.json();
    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      typeof body.reason !== "string" ||
      body.reason.trim().length < 3 ||
      body.reason.trim().length > 300
    )
      return apiProblem("Mã đạo hữu hoặc lý do không hợp lệ.", 400);
    let next, expected;
    try {
      next = parseSupportProfile(body.next);
      expected = parseSupportProfile(body.expected);
    } catch (e) {
      return apiProblem(
        e instanceof Error ? e.message : "Hồ sơ không hợp lệ.",
        400,
      );
    }
    const db = createSupabaseAdminClient();
    const { data: target, error: lookupError } = await db
      .from("app_users")
      .select("role,avatar_updated_at")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!target) return apiProblem("Không tìm thấy đạo hữu.", 404);
    if (next.avatarId === "upload" && !target.avatar_updated_at)
      return apiProblem(
        "Đạo hữu chưa tải ảnh riêng. Hãy chọn avatar có sẵn.",
        400,
      );
    const frame = avatarFrames.find((f) => f.id === next.avatarFrameId)!;
    if (
      target.role !== "admin" &&
      next.cultivationXp < frame.minXp &&
      !next.frameGrants.includes(frame.id)
    )
      next.avatarFrameId = "none";
    const { error } = await db.rpc("admin_support_profile", {
      p_actor: admin.email,
      p_id: id,
      p_expected: expected,
      p_next: next,
      p_reason: body.reason.trim(),
    });
    if (error?.code === "40001")
      return apiProblem(
        "Hồ sơ vừa thay đổi. Tải lại trước khi chỉnh sửa để không ghi đè dữ liệu mới.",
        409,
      );
    if (error?.code === "PGRST202" || error?.code === "42703")
      return apiProblem(
        "Cần chạy migration quản trị cộng đồng trước khi lưu.",
        503,
      );
    if (error) throw error;
    return apiData(null);
  } catch (error) {
    return apiError(error, "Chưa thể hỗ trợ hồ sơ.");
  }
}
