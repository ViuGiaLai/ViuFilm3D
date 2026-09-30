import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
import { notificationsRealtimeTopic } from "@/lib/server/realtime-notify";

export async function GET() {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    
    const db = createSupabaseAdminClient();
    const { data, error } = await db
      .from("notifications")
      .select("id, type, content, link, is_read, created_at")
      .eq("user_id", viewer.id)
      .order("created_at", { ascending: false })
      .limit(50);
      
    if (error) throw error;
    
    const unreadCount = data.filter((n) => !n.is_read).length;
    
    return apiData({
      items: data,
      unreadCount,
      realtimeTopic: notificationsRealtimeTopic(viewer.id),
    });
  } catch (error) {
    return apiError(error, "Không thể lấy danh sách thông báo.");
  }
}

export async function PATCH(request: Request) {
  try {
    const viewer = await getViewerIdentity();
    if (!viewer) return apiProblem("Vui lòng đăng nhập.", 401);
    
    const body = await request.json().catch(() => ({}));
    const id = body.id ? Number(body.id) : null;
    
    const db = createSupabaseAdminClient();
    
    if (id) {
      // Đánh dấu 1 thông báo đã đọc
      const { error } = await db
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", viewer.id)
        .eq("id", id);
      if (error) throw error;
    } else {
      // Đánh dấu tất cả đã đọc
      const { error } = await db
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", viewer.id)
        .eq("is_read", false);
      if (error) throw error;
    }
    
    return apiData({ success: true });
  } catch (error) {
    return apiError(error, "Không thể cập nhật thông báo.");
  }
}
