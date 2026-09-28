import type { SiteSettings, Viewer } from "@/lib/admin-data";
import {
  createSupabaseAdminClient,
  createSupabaseReadClient,
} from "@/lib/supabase/server";
import { DatabaseError, ValidationError } from "@/lib/server/errors";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: Viewer["role"];
  status: Viewer["status"];
  plan: Viewer["plan"];
  joined_at: string;
  last_active: string;
  watches: number;
  auth_user_id?: string | null;
  public_id?: string;
  cultivation_xp?: number;
  avatar_id?: string;
  avatar_updated_at?: string | null;
  avatar_frame_id?: string;
  avatar_frame_grants?: string[];
  bio?: string;
};

type SettingsRow = {
  site_name: string;
  tagline: string;
  support_email: string;
  maintenance: boolean;
  allow_registration: boolean;
  show_view_count: boolean;
  items_per_page: number;
};

const fromUserRow = (row: UserRow): Viewer => ({
  id: Number(row.id),
  name: row.name,
  email: row.email,
  role: row.role,
  status: row.status,
  plan: row.plan,
  joinedAt: row.joined_at,
  lastActive: row.last_active,
  watches: Number(row.watches),
  hasLogin: Boolean(row.auth_user_id),
  publicId: row.public_id,
  cultivationXp: Number(row.cultivation_xp ?? 0),
  avatarId: row.avatar_id,
  avatarVersion: row.avatar_updated_at,
  avatarFrameId: row.avatar_frame_id,
  frameGrants: row.avatar_frame_grants ?? [],
  bio: row.bio ?? "",
});

const fromSettingsRow = (row: SettingsRow): SiteSettings => ({
  siteName: row.site_name,
  tagline: row.tagline,
  supportEmail: row.support_email,
  maintenance: row.maintenance,
  allowRegistration: row.allow_registration,
  showViewCount: row.show_view_count,
  itemsPerPage: row.items_per_page,
});

const toSettingsRow = (settings: SiteSettings) => ({
  id: 1,
  site_name: settings.siteName,
  tagline: settings.tagline,
  support_email: settings.supportEmail.toLowerCase(),
  maintenance: settings.maintenance,
  allow_registration: settings.allowRegistration,
  show_view_count: settings.showViewCount,
  items_per_page: settings.itemsPerPage,
});

const fail = (message: string): never => {
  throw new DatabaseError("Không thể truy cập dữ liệu quản trị.", message);
};

export const adminRepository = {
  async listUsers(): Promise<Viewer[]> {
    const { data, error } = await createSupabaseAdminClient()
      .from("app_users")
      .select("*")
      .order("id", { ascending: true });

    if (error) fail(error.message);
    return ((data ?? []) as UserRow[]).map(fromUserRow);
  },

  async saveUser(viewer: Viewer): Promise<Viewer> {
    const db = createSupabaseAdminClient();
    const { data: existing, error: lookupError } = await db
      .from("app_users")
      .select("id,email,role,auth_user_id")
      .eq("id", viewer.id)
      .maybeSingle();
    if (lookupError) fail(lookupError.message);
    if (!existing) {
      throw new ValidationError(
        "Người xem cần tự đăng ký để có tài khoản đăng nhập.",
      );
    }
    if (
      existing.role === "admin" &&
      (viewer.role !== "admin" ||
        viewer.email.toLowerCase() !== existing.email ||
        viewer.status !== "Đang hoạt động")
    ) {
      throw new ValidationError(
        "Không thể khóa, đổi email hoặc vai trò của tài khoản quản trị.",
      );
    }
    if (
      existing.role !== viewer.role ||
      existing.email !== viewer.email.toLowerCase()
    ) {
      throw new ValidationError(
        "Không thể đổi email hoặc cấp quyền quản trị qua hồ sơ người xem.",
      );
    }

    // Never trust client-supplied identity, activity counters or registration dates.
    const changes = {
      name: viewer.name,
      status: viewer.status,
      plan: viewer.plan,
    };
    const { data, error } = await db
      .from("app_users")
      .update(changes)
      .eq("id", viewer.id)
      .select("*")
      .single();

    if (error) fail(error.message);
    return fromUserRow(data as UserRow);
  },

  async removeUser(id: number): Promise<boolean> {
    const db = createSupabaseAdminClient();
    const { data: existing, error: lookupError } = await db
      .from("app_users")
      .select("auth_user_id")
      .eq("id", id)
      .neq("role", "admin")
      .maybeSingle();
    if (lookupError) fail(lookupError.message);
    if (!existing) return false;

    if (existing.auth_user_id) {
      const { error: authError } = await db.auth.admin.deleteUser(
        existing.auth_user_id,
      );
      if (authError) fail(authError.message);
    }

    const { data, error } = await db
      .from("app_users")
      .delete()
      .eq("id", id)
      .neq("role", "admin")
      .select("id");

    if (error) fail(error.message);
    // Deleting the Auth user may already cascade-delete its application profile.
    return Boolean(existing.auth_user_id || data?.length);
  },

  async getSettings(): Promise<SiteSettings | null> {
    const { data, error } = await createSupabaseReadClient()
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) fail(error.message);
    return data ? fromSettingsRow(data as SettingsRow) : null;
  },

  async saveSettings(settings: SiteSettings): Promise<SiteSettings> {
    const { data, error } = await createSupabaseAdminClient()
      .from("site_settings")
      .upsert(toSettingsRow(settings), { onConflict: "id" })
      .select("*")
      .single();

    if (error) fail(error.message);
    return fromSettingsRow(data as SettingsRow);
  },
};
