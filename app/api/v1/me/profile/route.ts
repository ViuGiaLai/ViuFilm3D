import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { validAvatarIds } from "@/lib/social-types";
import { avatarFrames } from "@/lib/avatar-frames";
import { hasUploadedAvatar } from "@/lib/profile-validation";

export async function PATCH(request: Request) {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const body = (await request.json()) as {
      name?: unknown;
      avatarId?: unknown;
      bio?: unknown;
      avatarFrameId?: unknown;
    };
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const avatarId = typeof body.avatarId === "string" ? body.avatarId : "moon";
    const bio = typeof body.bio === "string" ? body.bio.trim() : "";
    const avatarFrameId =
      typeof body.avatarFrameId === "string"
        ? body.avatarFrameId
        : (viewer.account.avatarFrameId ?? "none");
    const frame = avatarFrames.find((item) => item.id === avatarFrameId);
    if (!viewer.account.publicId && avatarFrameId !== "none") {
      return apiProblem(
        "Bộ sưu tập viền đang được chuẩn bị. Vui lòng thử lại sau.",
        503,
      );
    }
    if (!frame || (viewer.account.role !== "admin" && (viewer.account.cultivationXp ?? 0) < frame.minXp && !viewer.account.frameGrants?.includes(frame.id))) {
      return apiProblem("Viền ảnh chưa được mở khóa hoặc không hợp lệ.", 400);
    }
    if (name.length < 2 || name.length > 100) {
      return apiProblem("Tên hiển thị cần từ 2 đến 100 ký tự.", 400);
    }
    if (!validAvatarIds.includes(avatarId)) {
      return apiProblem("Ảnh đại diện không hợp lệ.", 400);
    }
    if (
      avatarId === "upload" &&
      !hasUploadedAvatar(viewer.account.avatarVersion)
    ) {
      return apiProblem(
        "Hãy tải ảnh đại diện lên trước khi chọn ảnh riêng.",
        400,
      );
    }
    if (bio.length > 300) {
      return apiProblem("Giới thiệu tối đa 300 ký tự.", 400);
    }
    const { data, error } = await createSupabaseAdminClient()
      .from("app_users")
      .update({
        name,
        avatar_id: avatarId,
        bio,
        ...(viewer.account.publicId ? { avatar_frame_id: avatarFrameId } : {}),
      })
      .eq("id", viewer.id)
      .select("*")
      .single();
    if (error) throw error;
    return apiData({
      id: Number(data.id),
      publicId: data.public_id,
      cultivationXp: Number(data.cultivation_xp ?? 0),
      avatarFrameId: data.avatar_frame_id,
      frameGrants: data.avatar_frame_grants ?? [],
      email: data.email,
      name: data.name,
      role: data.role,
      avatarId: data.avatar_id,
      avatarVersion: data.avatar_updated_at,
      bio: data.bio,
    });
  } catch (error) {
    return apiError(error, "Không thể cập nhật hồ sơ.");
  }
}
