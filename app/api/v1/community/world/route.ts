import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { notifyWorld } from "@/lib/server/realtime-notify";

const columns =
  "id,sender_id,body,created_at,app_users!world_messages_sender_id_fkey(id,public_id,name,avatar_id,avatar_updated_at,avatar_frame_id,cultivation_xp,bio)";
function mapMessage(row: Record<string, unknown>) {
  const author = row.app_users as Record<string, unknown> | null;
  return {
    id: Number(row.id),
    senderId: Number(row.sender_id),
    body: String(row.body),
    createdAt: String(row.created_at),
    author: {
      id: Number(author?.id),
      publicId: String(author?.public_id ?? ""),
      name: String(author?.name ?? "Đạo hữu"),
      avatarId: String(author?.avatar_id ?? "moon"),
      avatarVersion: author?.avatar_updated_at as string | null,
      avatarFrameId: String(author?.avatar_frame_id ?? "none"),
      cultivationXp: Number(author?.cultivation_xp ?? 0),
      bio: String(author?.bio ?? ""),
    },
  };
}
function schemaProblem(code?: string) {
  return code === "42P01" || code === "PGRST205" || code === "PGRST202";
}
export async function GET(request: Request) {
  try {
    if (!(await getSocialIdentity()))
      return apiProblem("Đạo hữu cần đăng nhập để tham gia luận đạo.", 401);
    const before = new URL(request.url).searchParams.get("before");
    if (
      before &&
      (!Number.isSafeInteger(Number(before)) || Number(before) <= 0)
    )
      return apiProblem("Mốc luận đạo không hợp lệ.", 400);
    let query = createSupabaseAdminClient()
      .from("world_messages")
      .select(columns)
      .eq("status", "visible")
      .order("id", { ascending: false })
      .limit(51);
    if (before) query = query.lt("id", Number(before));
    const { data, error } = await query;
    if (error) {
      if (schemaProblem(error.code))
        return apiProblem(
          "Kênh luận đạo chưa được khai mở. Quản trị cần cập nhật dữ liệu hệ thống.",
          503,
        );
      throw error;
    }
    return apiData(
      {
        items: (data ?? [])
          .slice(0, 50)
          .reverse()
          .map((row) => mapMessage(row)),
        hasMore: (data?.length ?? 0) > 50,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "Chưa thể tải kênh luận đạo.");
  }
}
export async function POST(request: Request) {
  try {
    const viewer = await getSocialIdentity();
    if (!viewer) return apiProblem("Đạo hữu cần đăng nhập để luận đạo.", 401);
    const input = (await request.json()) as { body?: unknown };
    const body = typeof input.body === "string" ? input.body.trim() : "";
    if (!body || body.length > 1000)
      return apiProblem("Lời luận đạo cần từ 1 đến 1000 ký tự.", 400);
    const db = createSupabaseAdminClient();
    const saved = await db.rpc("send_world_message", {
      p_sender_id: viewer.id,
      p_body: body,
    });
    if (saved.error) {
      if (schemaProblem(saved.error.code))
        return apiProblem(
          "Kênh luận đạo chưa được khai mở. Quản trị cần cập nhật dữ liệu hệ thống.",
          503,
        );
      if (saved.error.code === "P0001")
        return apiProblem(
          "Đạo hữu hãy đợi hai giây trước khi luận đạo tiếp.",
          429,
        );
      throw saved.error;
    }
    const row = Array.isArray(saved.data) ? saved.data[0] : saved.data;
    const { data, error } = await db
      .from("world_messages")
      .select(columns)
      .eq("id", row.id)
      .single();
    if (error) throw error;
    await notifyWorld();
    return apiData(mapMessage(data), { status: 201 });
  } catch (error) {
    return apiError(error, "Chưa thể gửi lời luận đạo.");
  }
}
