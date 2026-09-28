import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import {
  findFriendLink,
  parsePositiveId,
} from "@/lib/server/social-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { notifySocial } from "@/lib/server/realtime-notify";

type Context = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: Context) {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const targetId = parsePositiveId((await context.params).id);
    if (!targetId || targetId === viewer.id) {
      return apiProblem("Không thể gửi lời mời cho chính mình.", 400);
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
    if (await findFriendLink(viewer.id, targetId)) {
      return apiProblem("Hai đạo hữu đã có lời mời hoặc đã kết giao.", 409);
    }
    const { error } = await db.from("friend_links").insert({
      requester_id: viewer.id,
      recipient_id: targetId,
    });
    if (error?.code === "23505") {
      return apiProblem("Lời mời đã tồn tại.", 409);
    }
    if (error) throw error;
    await notifySocial([targetId, viewer.id]);
    return apiData({ sent: true }, { status: 201 });
  } catch (error) {
    return apiError(error, "Không thể gửi lời mời kết giao.");
  }
}
