import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getViewerIdentity } from "@/lib/server/viewer-session";
import { hasAdminSession } from "@/lib/server/admin-session";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Context) {
  try {
    const id = Number((await context.params).id);
    if (!Number.isSafeInteger(id) || id <= 0) {
      return apiProblem("Bình luận không hợp lệ.", 400);
    }
    const viewer = await getViewerIdentity();
    const admin = await hasAdminSession();
    if (!viewer && !admin) return apiProblem("Vui lòng đăng nhập.", 401);

    let query = createSupabaseAdminClient()
      .from("movie_comments")
      .delete()
      .eq("id", id);
    if (!admin) query = query.eq("user_id", viewer!.id);
    const { data, error } = await query.select("id");
    if (error) throw error;
    if (!data?.length)
      return apiProblem(
        "Không tìm thấy bình luận hoặc bạn không có quyền xóa.",
        404,
      );
    return apiData({ deleted: true });
  } catch (error) {
    return apiError(error, "Không thể xóa bình luận.");
  }
}

export async function PATCH(request: Request, context: Context) {
  if (!(await hasAdminSession()))
    return apiProblem("Không có quyền quản lý bình luận.", 401);
  try {
    const id = Number((await context.params).id);
    const body = (await request.json()) as { status?: unknown };
    if (
      !Number.isSafeInteger(id) ||
      id <= 0 ||
      (body.status !== "visible" && body.status !== "hidden")
    ) {
      return apiProblem("Dữ liệu bình luận không hợp lệ.", 400);
    }
    const { data, error } = await createSupabaseAdminClient()
      .from("movie_comments")
      .update({ status: body.status })
      .eq("id", id)
      .select("id,status")
      .maybeSingle();
    if (error) throw error;
    if (!data) return apiProblem("Không tìm thấy bình luận.", 404);
    return apiData(data);
  } catch (error) {
    return apiError(error, "Không thể cập nhật bình luận.");
  }
}
