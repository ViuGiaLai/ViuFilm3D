"use client";

import { useEffect, useRef, useState } from "react";
import { apiMode } from "@/lib/config";
import {
  Check,
  Cloud,
  Database,
  RefreshCw,
  Save,
  Server,
  Settings,
  ShieldCheck,
} from "lucide-react";
import type { SiteSettings } from "@/lib/admin-data";
import { adminDataCache } from "@/lib/admin-cache";

export default function AdminSettings({
  settings,
  save,
}: {
  settings: SiteSettings;
  save: (settings: SiteSettings) => Promise<void>;
}) {
  const [form, setForm] = useState(settings);
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  useEffect(() => setForm(settings), [settings]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy.current) return;
    if (
      form.maintenance &&
      !settings.maintenance &&
      !window.confirm("Bật chế độ bảo trì website?")
    )
      return;
    busy.current = true;
    setSaving(true);
    try {
      await save(form);
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const handleClearCache = () => {
    adminDataCache.comments = null;
    adminDataCache.worldMessages = null;
    adminDataCache.auditLogs = null;
    adminDataCache.viewers = null;
    adminDataCache.lastFetched = {};
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  return (
    <form className="admin-settings" onSubmit={submit}>
      {/* 1. Website Branding & Info */}
      <section>
        <div className="settings-heading">
          <Settings />
          <div>
            <h2>Thông tin website & Thương hiệu</h2>
            <p>Tên hệ thống, khẩu hiệu và kênh hỗ trợ khán giả.</p>
          </div>
        </div>
        <div className="settings-grid">
          <label>
            Tên website
            <input
              required
              value={form.siteName}
              onChange={(event) =>
                setForm({ ...form, siteName: event.target.value })
              }
            />
          </label>
          <label>
            Email hỗ trợ
            <input
              required
              type="email"
              value={form.supportEmail}
              onChange={(event) =>
                setForm({ ...form, supportEmail: event.target.value })
              }
            />
          </label>
          <label className="span-two">
            Khẩu hiệu (Tagline)
            <input
              required
              value={form.tagline}
              onChange={(event) =>
                setForm({ ...form, tagline: event.target.value })
              }
            />
          </label>
        </div>
      </section>

      {/* 2. Access & Security */}
      <section>
        <div className="settings-heading">
          <ShieldCheck />
          <div>
            <h2>Quyền truy cập & Bảo vệ</h2>
            <p>Kiểm soát đăng ký, bảo trì và hiển thị số liệu.</p>
          </div>
        </div>
        <label className="setting-toggle">
          <span>
            <b>Cho phép đăng ký tài khoản mới</b>
            <small>Khán giả mới có thể tự do tạo tài khoản và tu tiên.</small>
          </span>
          <input
            type="checkbox"
            checked={form.allowRegistration}
            onChange={(event) =>
              setForm({ ...form, allowRegistration: event.target.checked })
            }
          />
        </label>
        <label className="setting-toggle">
          <span>
            <b>Hiển thị số lượt xem công khai</b>
            <small>Hiển thị số lượt phát trực tuyến trên banner và trang phim.</small>
          </span>
          <input
            type="checkbox"
            checked={form.showViewCount}
            onChange={(event) =>
              setForm({ ...form, showViewCount: event.target.checked })
            }
          />
        </label>
        <label className="setting-toggle warning">
          <span>
            <b>Bật chế độ bảo trì hệ thống</b>
            <small>
              Hiển thị thông báo đang nâng cấp máy chủ; không gián đoạn API của ban quản trị.
            </small>
          </span>
          <input
            type="checkbox"
            checked={form.maintenance}
            onChange={(event) =>
              setForm({ ...form, maintenance: event.target.checked })
            }
          />
        </label>
      </section>

      {/* 3. Catalog Pagination */}
      <section>
        <div className="settings-heading">
          <Database />
          <div>
            <h2>Phân trang & Hiển thị dữ liệu</h2>
            <p>Cấu hình số lượng nội dung hiển thị trong khu vực quản trị.</p>
          </div>
        </div>
        <label>
          Số lượng phim mỗi trang
          <select
            value={form.itemsPerPage}
            onChange={(event) =>
              setForm({ ...form, itemsPerPage: Number(event.target.value) })
            }
          >
            <option value={10}>10 phim / trang</option>
            <option value={18}>18 phim / trang (Khuyên dùng cho Poster)</option>
            <option value={20}>20 phim / trang</option>
            <option value={30}>30 phim / trang</option>
            <option value={50}>50 phim / trang</option>
          </select>
        </label>
      </section>

      {/* 4. Infrastructure & Cache Management */}
      <section>
        <div className="settings-heading">
          <Server />
          <div>
            <h2>Hạ tầng & Bộ nhớ đệm (Cloud & Cache)</h2>
            <p>Tình trạng kết nối dịch vụ đám mây và tối ưu hiệu suất bộ nhớ.</p>
          </div>
        </div>

        <div className="infra-status-grid">
          <div className="infra-card">
            <div className="infra-header">
              <Database size={16} />
              <b>Supabase PostgreSQL</b>
              <span className="infra-pill active">Kết nối</span>
            </div>
            <p>Xác thực PKCE, OAuth Google, lưu trữ dữ liệu phim & cộng đồng.</p>
          </div>

          <div className="infra-card">
            <div className="infra-header">
              <Cloud size={16} />
              <b>Cloudflare R2 Media</b>
              <span className="infra-pill active">Sẵn sàng</span>
            </div>
            <p>Phân phối Video HLS m3u8, MP4, ảnh bìa và avatar không giới hạn băng thông.</p>
          </div>
        </div>

        <div className="cache-action-box">
          <div>
            <b>Làm mới bộ nhớ đệm Admin (RAM SWR Cache)</b>
            <p>
              Xóa sạch dữ liệu đệm bình luận, người dùng và nhật ký để đồng bộ dữ liệu mới nhất từ máy chủ.
            </p>
          </div>
          <button
            type="button"
            className="secondary-btn cache-btn"
            onClick={handleClearCache}
          >
            {cacheCleared ? (
              <>
                <Check size={14} color="#10b981" />
                <span>Đã làm mới bộ nhớ đệm</span>
              </>
            ) : (
              <>
                <RefreshCw size={14} />
                <span>Làm mới RAM cache</span>
              </>
            )}
          </button>
        </div>
      </section>

      <div className="settings-save">
        <span>
          {apiMode === "mock"
            ? "Đang ở chế độ mô phỏng (Mock Mode)."
            : "Cấu hình được lưu trực tiếp vào cơ sở dữ liệu Supabase."}
        </span>
        <button
          className="primary-btn"
          disabled={saving || JSON.stringify(form) === JSON.stringify(settings)}
        >
          <Save /> {saving ? "Đang lưu cấu hình…" : "Lưu cấu hình hệ thống"}
        </button>
      </div>
    </form>
  );
}
