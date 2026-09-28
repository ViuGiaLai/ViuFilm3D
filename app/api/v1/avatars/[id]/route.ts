import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { parsePositiveId } from "@/lib/server/social-repository";
import { r2Avatar } from "@/lib/server/r2";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const id = parsePositiveId((await context.params).id);
  if (!id) return new Response(null, { status: 404 });
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("app_users")
      .select("avatar_id,status")
      .eq("id", id)
      .maybeSingle();
    if (
      error ||
      data?.avatar_id !== "upload" ||
      data.status !== "Đang hoạt động"
    ) {
      return new Response(null, { status: 404 });
    }
    const image = await r2Avatar.read(id);
    if (!image) return new Response(null, { status: 404 });
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(image.contentType)
    ) {
      return new Response(null, { status: 404 });
    }
    return new Response(Buffer.from(image.bytes), {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=60",
        ...(image.etag ? { ETag: image.etag } : {}),
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
