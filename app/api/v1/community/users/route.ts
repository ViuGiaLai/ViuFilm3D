import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { apiData, apiError } from "@/lib/server/api-response";
import type { SocialUser } from "@/lib/social-types";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) return apiData<SocialUser[]>([]);
    const term = query.slice(0, 60).replace(/[%_,()]/g, "");
    if (term.length < 2) return apiData<SocialUser[]>([]);
    const { data, error } = await createSupabaseAdminClient()
      .from("app_users")
      .select("*")
      .eq("status", "Đang hoạt động")
      .ilike("name", `%${term}%`)
      .order("name")
      .limit(20);
    if (error) throw error;
    return apiData<SocialUser[]>(
      (data ?? []).map((row) => ({
        id: Number(row.id),
        publicId: row.public_id,
        cultivationXp: Number(row.cultivation_xp ?? 0),
        avatarFrameId: row.avatar_frame_id,
        name: row.name,
        avatarId: row.avatar_id,
        avatarVersion: row.avatar_updated_at,
        bio: row.bio,
      })),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error, "Không thể tìm người dùng.");
  }
}
