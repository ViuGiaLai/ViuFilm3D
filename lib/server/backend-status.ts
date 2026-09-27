import "server-only";
import {
  createSupabaseAdminClient,
  createSupabaseReadClient,
} from "@/lib/supabase/server";
import {
  isAdminAuthConfigured,
  isR2Configured,
  isSupabaseAdminConfigured,
  isSupabaseReadConfigured,
} from "@/lib/server/env";

export type ServiceState = "connected" | "not_configured" | "unavailable";

export type BackendStatus = {
  api: "ok";
  database: ServiceState;
  viewCounter: ServiceState;
  viewerFeatures: ServiceState;
  databaseAdmin: "configured" | "not_configured";
  adminAuth: "configured" | "not_configured";
  objectStorage: "configured" | "not_configured";
  ready: boolean;
};

export async function getBackendStatus(): Promise<BackendStatus> {
  let database: ServiceState = "not_configured";
  let viewCounter: ServiceState = "not_configured";
  let viewerFeatures: ServiceState = "not_configured";

  if (isSupabaseReadConfigured()) {
    try {
      // Do not use a HEAD request here. PostgREST can return 204 for HEAD even
      // when a table is absent from the schema cache, creating a false positive.
      const { error } = await createSupabaseReadClient()
        .from("movies")
        .select("id")
        .limit(1);
      database = error ? "unavailable" : "connected";
    } catch {
      database = "unavailable";
    }
  }

  if (isSupabaseAdminConfigured()) {
    try {
      const { error } = await createSupabaseAdminClient()
        .from("movie_view_events")
        .select("id")
        .limit(1);
      viewCounter = error ? "unavailable" : "connected";
    } catch {
      viewCounter = "unavailable";
    }

    try {
      const db = createSupabaseAdminClient();
      const checks = await Promise.all([
        db.from("app_users").select("auth_user_id").limit(1),
        db.from("movie_comments").select("id").limit(1),
        db.from("viewer_favorites").select("user_id").limit(1),
        db.from("viewer_history").select("user_id").limit(1),
      ]);
      viewerFeatures = checks.every((check) => !check.error)
        ? "connected"
        : "unavailable";
    } catch {
      viewerFeatures = "unavailable";
    }
  }

  const databaseAdmin = isSupabaseAdminConfigured()
    ? "configured"
    : "not_configured";
  const adminAuth = isAdminAuthConfigured() ? "configured" : "not_configured";
  const objectStorage = isR2Configured() ? "configured" : "not_configured";

  return {
    api: "ok",
    database,
    viewCounter,
    viewerFeatures,
    databaseAdmin,
    adminAuth,
    objectStorage,
    ready:
      database === "connected" &&
      viewCounter === "connected" &&
      databaseAdmin === "configured" &&
      adminAuth === "configured" &&
      objectStorage === "configured",
  };
}
