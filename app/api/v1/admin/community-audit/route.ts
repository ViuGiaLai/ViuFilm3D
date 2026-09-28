import { getAdminSession } from "@/lib/server/admin-session";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";
export async function GET() {
  if (!(await getAdminSession()))
    return apiProblem("Không có quyền xem nhật ký.", 401);
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("admin_community_audit")
      .select("*")
      .order("id", { ascending: false })
      .limit(50);
    if (error) throw error;
    return apiData(data ?? []);
  } catch (error) {
    return apiError(error, "Chưa thể tải nhật ký quản trị cộng đồng.");
  }
}
