import { createSupabaseReadClient } from "@/lib/supabase/server";
import { apiData, apiError, apiProblem } from "@/lib/server/api-response";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiProblem("Email không hợp lệ.", 400);
    }

    const { error } = await createSupabaseReadClient().auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      return apiProblem("Không thể gửi lại email xác nhận. Email có thể đã được xác nhận hoặc bạn đã gửi quá nhiều yêu cầu.", 400);
    }

    return apiData({ sent: true }, { status: 200 });
  } catch (error) {
    return apiError(error, "Không thể xử lý yêu cầu.");
  }
}
