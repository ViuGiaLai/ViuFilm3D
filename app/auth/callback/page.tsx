"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { BrandLogo as Logo } from "@/components/ui/brand-logo";

export default function AuthCallbackPage() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleAuth() {
      try {
        const supabase = getSupabaseBrowserClient();
        if (!supabase) {
          throw new Error("Không thể khởi tạo kết nối Supabase trên trình duyệt.");
        }

        // Check for error parameters directly from Google / Supabase
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const errorDesc =
            params.get("error_description") || params.get("error");
          if (errorDesc) {
            throw new Error(`Đăng nhập Google bị hủy hoặc thất bại: ${errorDesc}`);
          }
        }

        // Check if session is already parsed or in progress
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        let activeSession = session;

        if (!activeSession) {
          // Listen for auth state change from URL hash or PKCE exchange
          const sessionPromise = new Promise<typeof session>((resolve) => {
            const {
              data: { subscription },
            } = supabase.auth.onAuthStateChange((_event, newSession) => {
              if (newSession) {
                subscription.unsubscribe();
                resolve(newSession);
              }
            });

            // Timeout after 8 seconds if no session is captured
            setTimeout(() => {
              subscription.unsubscribe();
              resolve(null);
            }, 8000);
          });

          activeSession = await sessionPromise;
        }

        if (!activeSession) {
          throw new Error(
            "Không nhận được phiên đăng nhập từ Google. Vui lòng thử lại.",
          );
        }

        if (cancelled) return;

        // Sync session with backend to set HTTP-only viewer cookies
        const response = await fetch("/api/v1/auth/oauth-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session: activeSession }),
        });

        if (!response.ok) {
          const result = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            result.error || "Không thể đồng bộ phiên đăng nhập với hệ thống.",
          );
        }

        // Successfully authenticated! Restore previous destination or go to home
        let returnTo = "/";
        try {
          const saved = sessionStorage.getItem("viufilm_auth_return");
          if (saved && saved !== "/dang-nhap" && saved.startsWith("/")) {
            returnTo = saved;
          }
          sessionStorage.removeItem("viufilm_auth_return");
        } catch {
          // ignore
        }
        window.location.href = returnTo;
      } catch (err: unknown) {
        if (cancelled) return;
        const message =
          err instanceof Error
            ? err.message
            : "Đăng nhập Google không thành công.";
        setError(message);
      }
    }

    void handleAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="auth-callback-screen">
      <div className="auth-callback-box">
        <Logo />
        {error ? (
          <div className="auth-callback-error">
            <p>{error}</p>
            <a href="/dang-nhap" className="primary-btn">
              Quay lại đăng nhập
            </a>
          </div>
        ) : (
          <div className="auth-callback-loading">
            <span className="auth-spinner" />
            <p>Đang đồng bộ thần hồn với Google...</p>
            <span className="auth-callback-hint">
              Vui lòng chờ trong giây lát
            </span>
          </div>
        )}
      </div>
    </main>
  );
}
