import { getAdminSession } from "@/lib/server/admin-session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { notifyWorld } from "@/lib/server/realtime-notify";
export async function GET(request: Request) {
  if (!(await getAdminSession()))
    return apiProblem("Không có quyền kiểm duyệt Thế Giới.", 401);
  try {
    const p = new URL(request.url).searchParams;
    const offset = Number(p.get("offset") ?? 0),
      status = p.get("status") ?? "all",
      q = (p.get("q") ?? "").trim();
    if (
      !Number.isSafeInteger(offset) ||
      offset < 0 ||
      !["all", "visible", "hidden"].includes(status) ||
      q.length > 100
    )
      return apiProblem("Bộ lọc không hợp lệ.", 400);
    let query = createSupabaseAdminClient()
      .from("world_messages")
      .select(
        "id,sender_id,body,status,created_at,app_users!world_messages_sender_id_fkey(name,avatar_id,avatar_updated_at,avatar_frame_id,cultivation_xp)",
      )
      .order("id", { ascending: false });
    if (status !== "all") query = query.eq("status", status);
    if (q) query = query.ilike("body", `%${q.replace(/[%_\\]/g, "\\$&")}%`);
    const { data, error } = await query.range(offset, offset + 50);
    if (error) throw error;
    return apiData({
      items: (data ?? []).slice(0, 50).map((row) => {
        const a = row.app_users as unknown as {
          name: string;
          avatar_id: string;
          avatar_updated_at: string | null;
          avatar_frame_id: string;
          cultivation_xp: number;
        } | null;
        return {
          id: Number(row.id),
          senderId: Number(row.sender_id),
          body: row.body,
          status: row.status,
          createdAt: row.created_at,
          authorName: a?.name ?? "Đạo hữu",
          avatarId: a?.avatar_id,
          avatarVersion: a?.avatar_updated_at,
          avatarFrameId: a?.avatar_frame_id,
          cultivationXp: Number(a?.cultivation_xp ?? 0),
        };
      }),
      hasMore: (data?.length ?? 0) > 50,
    });
  } catch (error) {
    return apiError(error, "Chưa thể tải lời luận đạo.");
  }
}
export async function PATCH(request: Request) {
  const admin = await getAdminSession();
  if (!admin) return apiProblem("Không có quyền kiểm duyệt Thế Giới.", 401);
  try {
    const b = await request.json();
    if (
      !Number.isSafeInteger(b.id) ||
      b.id <= 0 ||
      !["visible", "hidden"].includes(b.status) ||
      typeof b.reason !== "string" ||
      b.reason.trim().length < 3 ||
      b.reason.trim().length > 300
    )
      return apiProblem("Dữ liệu kiểm duyệt không hợp lệ.", 400);
    const { error } = await createSupabaseAdminClient().rpc(
      "admin_moderate_world",
      {
        p_actor: admin.email,
        p_id: b.id,
        p_status: b.status,
        p_reason: b.reason.trim(),
      },
    );
    if (error?.code === "PGRST202")
      return apiProblem(
        "Cần chạy migration quản trị cộng đồng trước khi kiểm duyệt.",
        503,
      );
    if (error?.code === "P0002")
      return apiProblem("Lời luận đạo không còn tồn tại.", 404);
    if (error) throw error;
    await notifyWorld();
    return apiData(null);
  } catch (error) {
    return apiError(error, "Chưa thể kiểm duyệt lời luận đạo.");
  }
}
