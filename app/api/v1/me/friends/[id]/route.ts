import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { parsePositiveId } from "@/lib/server/social-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { notifySocial } from "@/lib/server/realtime-notify";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(_request: Request, context: Context) {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const id = parsePositiveId((await context.params).id);
    if (!id) return apiProblem("Lời mời không hợp lệ.", 400);
    const { data, error } = await createSupabaseAdminClient()
      .from("friend_links")
      .update({ status: "accepted" })
      .eq("id", id)
      .eq("recipient_id", viewer.id)
      .eq("status", "pending")
      .select("id,requester_id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return apiProblem("Lời mời không còn hiệu lực.", 404);
    await notifySocial([viewer.id, Number(data.requester_id)]);
    return apiData({ accepted: true });
  } catch (error) {
    return apiError(error, "Không thể chấp nhận lời mời.");
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    const id = parsePositiveId((await context.params).id);
    if (!id) return apiProblem("Liên kết không hợp lệ.", 400);
    const { data, error } = await createSupabaseAdminClient()
      .from("friend_links")
      .delete()
      .eq("id", id)
      .or(`requester_id.eq.${viewer.id},recipient_id.eq.${viewer.id}`)
      .select("id,requester_id,recipient_id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return apiProblem("Không tìm thấy liên kết.", 404);
    await notifySocial([Number(data.requester_id), Number(data.recipient_id)]);
    return apiData({ removed: true });
  } catch (error) {
    return apiError(error, "Không thể xóa liên kết.");
  }
}
