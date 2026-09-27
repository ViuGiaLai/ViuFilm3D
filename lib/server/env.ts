import "server-only";
import { ConfigurationError } from "@/lib/server/errors";

const getEnv = (name: string): string | undefined => {
  const val = process.env[name];
  return typeof val === "string" && val.trim().length > 0
    ? val.trim()
    : undefined;
};

const supabaseUrl = () =>
  getEnv("SUPABASE_URL") || getEnv("NEXT_PUBLIC_SUPABASE_URL");

const supabasePublishableKey = () =>
  getEnv("SUPABASE_PUBLISHABLE_KEY") ||
  getEnv("SUPABASE_ANON_KEY") ||
  getEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

export const isSupabaseReadConfigured = () =>
  Boolean(supabaseUrl() && supabasePublishableKey());

export const isSupabaseAdminConfigured = () =>
  Boolean(supabaseUrl() && getEnv("SUPABASE_SECRET_KEY"));

export const isAdminAuthConfigured = () =>
  Boolean(
    getEnv("ADMIN_EMAIL") &&
    getEnv("ADMIN_PASSWORD") &&
    (getEnv("AUTH_SECRET")?.length ?? 0) >= 32,
  );

export function getSupabaseReadEnv() {
  const url = supabaseUrl();
  const publishableKey = supabasePublishableKey();
  if (!url || !publishableKey) {
    throw new ConfigurationError(
      "Backend chưa được cấu hình kết nối đọc Supabase.",
    );
  }
  return { url, publishableKey };
}

export function getSupabaseAdminEnv() {
  const { url } = getSupabaseReadEnv();
  const secretKey = getEnv("SUPABASE_SECRET_KEY");
  if (!secretKey) {
    throw new ConfigurationError(
      "Backend chưa có SUPABASE_SECRET_KEY để thực hiện thao tác quản trị.",
    );
  }
  return { url, secretKey };
}

export function getAdminCredentials() {
  const email = getEnv("ADMIN_EMAIL")?.toLowerCase();
  const password = getEnv("ADMIN_PASSWORD");
  if (!email || !password) {
    throw new ConfigurationError(
      "Backend chưa cấu hình ADMIN_EMAIL và ADMIN_PASSWORD.",
    );
  }
  return { email, password };
}

export function getAuthSecret() {
  const secret = getEnv("AUTH_SECRET");
  if (!secret || secret.length < 32) {
    throw new ConfigurationError("AUTH_SECRET phải có ít nhất 32 ký tự.");
  }
  return secret;
}

export function getR2Env() {
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY");
  const endpoint = getEnv("R2_ENDPOINT");
  const bucket = getEnv("R2_BUCKET");

  if (!accessKeyId || !secretAccessKey || !endpoint || !bucket) {
    throw new ConfigurationError(
      "Backend chưa cấu hình đủ R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT và R2_BUCKET.",
    );
  }

  let normalizedEndpoint: string;
  try {
    normalizedEndpoint = new URL(endpoint).origin;
  } catch {
    throw new ConfigurationError("R2_ENDPOINT không phải URL hợp lệ.");
  }

  return {
    accessKeyId,
    secretAccessKey,
    endpoint: normalizedEndpoint,
    bucket,
  };
}

export const isR2Configured = () =>
  Boolean(
    getEnv("R2_ACCESS_KEY_ID") &&
    getEnv("R2_SECRET_ACCESS_KEY") &&
    getEnv("R2_ENDPOINT") &&
    getEnv("R2_BUCKET"),
  );
