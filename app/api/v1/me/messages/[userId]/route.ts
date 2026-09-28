import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getSocialIdentity } from "@/lib/server/social-identity";
import {
  findFriendLink,
  parsePositiveId,
} from "@/lib/server/social-repository";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import type { DirectMessage } from "@/lib/social-types";
import { notifySocial } from "@/lib/server/realtime-notify";

type Context = { params: Promise<{ userId: string }> };

async function conversation(context: Context) {
  const viewer = await getSocialIdentity();
  if (!viewer) return null;
  const targetId = parsePositiveId((await context.params).userId);
  if (!targetId || targetId === viewer.id) return null;
  const link = await findFriendLink(viewer.id, targetId);
  if (link?.status !== "accepted") return null;
  return { viewer, targetId };
}

function fromMessage(row: Record<string, unknown>): DirectMessage {
  return {
    id: Number(row.id),
    senderId: Number(row.sender_id),
    recipientId: Number(row.recipient_id),
    body: String(row.body),
    createdAt: String(row.created_at),
    readAt: typeof row.read_at === "string" ? row.read_at : null,
  };
}

export async function GET(request: Request, context: Context) {
  try {
    const active = await conversation(context);
    if (!active) return apiProblem("Chỉ bằng hữu mới có thể xem mật thư.", 403);
    const { viewer, targetId } = active;
    const db = createSupabaseAdminClient();
    const before = new URL(request.url).searchParams.get("before");
    if (before && !parsePositiveId(before))
      return apiProblem("Mốc mật thư không hợp lệ.", 400);
    let query = db
      .from("direct_messages")
      .select("id,sender_id,recipient_id,body,created_at,read_at")
      .in("sender_id", [viewer.id, targetId])
      .in("recipient_id", [viewer.id, targetId])
      .order("id", { ascending: false })
      .limit(50);
    if (before) query = query.lt("id", Number(before));
    const { data, error } = await query;
    if (error) throw error;
    const receivedIds = (data ?? [])
      .filter((row) => row.sender_id === targetId && !row.read_at)
      .map((row) => row.id);
    if (receivedIds.length) {
      const marked = await db
        .from("direct_messages")
        .update({ read_at: new Date().toISOString() })
        .eq("sender_id", targetId)
        .eq("recipient_id", viewer.id)
        .in("id", receivedIds)
        .is("read_at", null);
      if (marked.error) throw marked.error;
      await notifySocial([targetId, viewer.id]);
    }
    return apiData<DirectMessage[]>((data ?? []).reverse().map(fromMessage), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return apiError(error, "Không thể tải tin nhắn.");
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const active = await conversation(context);
    if (!active) return apiProblem("Chỉ bằng hữu mới có thể gửi mật thư.", 403);
    const { viewer, targetId } = active;
    const body = (await request.json()) as { body?: unknown };
    const content = typeof body.body === "string" ? body.body.trim() : "";
    if (!content || content.length > 1000) {
      return apiProblem("Mật thư cần từ 1 đến 1000 ký tự.", 400);
    }
    const db = createSupabaseAdminClient();
    const latest = await db
      .from("direct_messages")
      .select("created_at")
      .eq("sender_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest.error) throw latest.error;
    if (latest.data && Date.now() - Date.parse(latest.data.created_at) < 1000) {
      return apiProblem("Vui lòng đợi một giây trước khi gửi tiếp.", 429);
    }
    const { data, error } = await db
      .from("direct_messages")
      .insert({
        sender_id: viewer.id,
        recipient_id: targetId,
        body: content,
      })
      .select("id,sender_id,recipient_id,body,created_at,read_at")
      .single();
    if (error) throw error;
    await notifySocial([targetId, viewer.id]);
    return apiData<DirectMessage>(fromMessage(data), { status: 201 });
  } catch (error) {
    return apiError(error, "Không thể gửi tin nhắn.");
  }
}
