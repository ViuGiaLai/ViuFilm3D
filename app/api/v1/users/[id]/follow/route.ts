import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { parsePositiveId } from "@/lib/server/social-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

type Context = { params: Promise<{ id: string }> };

async function setFollow(context: Context, following: boolean) {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const targetId = parsePositiveId((await context.params).id);
    if (!targetId || targetId === viewer.id) {
      return apiProblem("Không thể theo dõi chính mình.", 400);
    }
    const db = createSupabaseAdminClient();
    const target = await db
      .from("app_users")
      .select("id")
      .eq("id", targetId)
      .eq("status", "Đang hoạt động")
      .maybeSingle();
    if (target.error) throw target.error;
    if (!target.data) return apiProblem("Không tìm thấy người dùng.", 404);
    const changed = following
      ? await db
          .from("user_follows")
          .upsert(
            { follower_id: viewer.id, followed_id: targetId },
            { onConflict: "follower_id,followed_id", ignoreDuplicates: true },
          )
      : await db
          .from("user_follows")
          .delete()
          .eq("follower_id", viewer.id)
          .eq("followed_id", targetId);
    if (changed.error) throw changed.error;
    return apiData({ following });
  } catch (error) {
    return apiError(error, "Không thể cập nhật theo dõi.");
  }
}

export async function PUT(_request: Request, context: Context) {
  return setFollow(context, true);
}

export async function DELETE(_request: Request, context: Context) {
  return setFollow(context, false);
}
