import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { r2Avatar } from "@/lib/server/r2";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

export const runtime = "nodejs";

function detectedType(bytes: Uint8Array): string | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  )
    return "image/jpeg";
  if (
    bytes.length >= 8 &&
    [137, 80, 78, 71, 13, 10, 26, 10].every(
      (value, index) => bytes[index] === value,
    )
  )
    return "image/png";
  if (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function POST(request: Request) {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > 2.5 * 1024 * 1024) {
      return apiProblem("Ảnh đại diện cần nhỏ hơn 2 MB.", 413);
    }
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 2 * 1024 * 1024
    ) {
      return apiProblem("Ảnh đại diện cần nhỏ hơn 2 MB.", 400);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const contentType = detectedType(bytes);
    if (!contentType || contentType !== file.type) {
      return apiProblem("Chỉ hỗ trợ ảnh JPEG, PNG hoặc WebP hợp lệ.", 400);
    }
    await r2Avatar.upload(viewer.id, bytes, contentType);
    const avatarVersion = new Date().toISOString();
    const { data, error } = await createSupabaseAdminClient()
      .from("app_users")
      .update({ avatar_id: "upload", avatar_updated_at: avatarVersion })
      .eq("id", viewer.id)
      .select("*")
      .single();
    if (error) throw error;
    return apiData({
      id: Number(data.id),
      publicId: data.public_id,
      cultivationXp: Number(data.cultivation_xp ?? 0),
      avatarFrameId: data.avatar_frame_id,
      email: data.email,
      name: data.name,
      role: data.role,
      bio: data.bio,
      avatarId: data.avatar_id,
      avatarVersion: data.avatar_updated_at,
    });
  } catch (error) {
    return apiError(error, "Không thể tải ảnh đại diện.");
  }
}
