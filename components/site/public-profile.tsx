"use client";

import { useEffect, useState } from "react";
import { MessageCircle, UserPlus, UserRoundCheck } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  CultivationBadge,
  CultivationProgress,
} from "@/components/ui/cultivation-badge";
import { socialGateway } from "@/lib/social-gateway";
import type { PublicProfile } from "@/lib/social-types";
import type { Account } from "@/lib/app-types";
import type { Navigate } from "@/components/site/types";

type Props = {
  id: string;
  viewer: Account | null;
  go: Navigate;
  openMessages: (userId: number) => void;
};

export default function PublicProfilePage({
  id,
  viewer,
  go,
  openMessages,
}: Props) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    void socialGateway.profile(id).then(
      (result) => {
        if (active) {
          setProfile(result);
          setLoading(false);
        }
      },
      () => {
        if (active) {
          setProfile(null);
          setError("Không thể tải hồ sơ này.");
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
    };
  }, [id, viewer?.id]);

  const changeFriendship = async (action: "invite" | "accept" | "remove") => {
    if (!profile || busy) return;
    setBusy(true);
    setError("");
    try {
      if (action === "invite") await socialGateway.invite(profile.id);
      else if (action === "accept" && profile.relationLinkId) {
        await socialGateway.accept(profile.relationLinkId);
      } else if (action === "remove" && profile.relationLinkId) {
        await socialGateway.remove(profile.relationLinkId);
      }
      setProfile(await socialGateway.profile(id));
    } catch {
      setError("Chưa thể cập nhật lời mời. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const changeFollowing = async () => {
    if (!profile || busy) return;
    setBusy(true);
    setError("");
    try {
      await socialGateway.follow(profile.id, !profile.following);
      setProfile(await socialGateway.profile(id));
    } catch {
      setError("Chưa thể cập nhật theo dõi. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <main className="page-shell public-profile">Đang tải hồ sơ…</main>;
  }
  if (!profile) {
    return (
      <main className="page-shell public-profile">
        <p className="form-error">{error}</p>
        <button onClick={() => go("/")}>Về trang chủ</button>
      </main>
    );
  }

  return (
    <main className="page-shell public-profile">
      <div className="public-profile-hero">
        <div className="public-profile-cover" aria-hidden="true">
          <span>
            ĐỘNG PHỦ <i>·</i> TIÊN LỘ
          </span>
          <b>Vân sơn · Tụ linh</b>
        </div>
        <div className="public-profile-summary">
          <UserAvatar
            frameId={profile.avatarFrameId}
            cultivationXp={profile.cultivationXp}
            avatarId={profile.avatarId}
            avatarVersion={profile.avatarVersion}
            userId={profile.id}
            name={profile.name}
            size="large"
          />
          <div>
            <span className="mini-label">HỒ SƠ VIUFILM3D</span>
            <h1>{profile.name}</h1>
            <CultivationBadge xp={profile.cultivationXp} />
            <p>
              Tham gia {new Date(profile.joinedAt).toLocaleDateString("vi-VN")}
              {profile.role === "admin" ? " · Quản trị viên" : ""}
            </p>
          </div>
          <div className="public-profile-actions">
            {viewer && profile.relation !== "self" && (
              <button
                className={profile.following ? "secondary" : undefined}
                disabled={busy}
                onClick={() => void changeFollowing()}
              >
                {profile.following ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}
            {profile.relation === "self" ? (
              <button onClick={() => go("/tai-khoan")}>Chỉnh sửa hồ sơ</button>
            ) : !viewer ? (
              <button onClick={() => go("/dang-nhap")}>
                Đăng nhập để kết giao
              </button>
            ) : profile.relation === "none" ? (
              <button
                disabled={busy}
                onClick={() => void changeFriendship("invite")}
              >
                <UserPlus size={17} /> Kết giao
              </button>
            ) : profile.relation === "received" ? (
              <button
                disabled={busy}
                onClick={() => void changeFriendship("accept")}
              >
                <UserRoundCheck size={17} /> Chấp nhận lời mời
              </button>
            ) : profile.relation === "sent" ? (
              <button
                disabled={busy}
                onClick={() => void changeFriendship("remove")}
              >
                Hủy lời mời
              </button>
            ) : (
              <>
                <button onClick={() => openMessages(profile.id)}>
                  <MessageCircle size={17} /> Truyền mật thư
                </button>
                <button
                  className="secondary"
                  disabled={busy}
                  onClick={() => void changeFriendship("remove")}
                >
                  Hủy kết giao
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <CultivationProgress xp={profile.cultivationXp} />
      <div className="public-profile-grid">
        <section className="public-profile-card">
          <h2>Giới thiệu</h2>
          <p>{profile.bio || "Đạo hữu chưa viết lời giới thiệu."}</p>
          <div className="public-profile-stats">
            <span>{profile.followersCount} người theo dõi</span>
            <span>{profile.followingCount} đang theo dõi</span>
            <span>{profile.commentCount} bình luận công khai</span>
          </div>
        </section>
        <section className="public-profile-card">
          <h2>Bình luận gần đây</h2>
          {profile.comments.length ? (
            profile.comments.map((comment) => (
              <button
                key={comment.id}
                className="public-profile-comment"
                onClick={() =>
                  comment.movieSlug && go(`/phim/${comment.movieSlug}`)
                }
              >
                <strong>{comment.movieTitle}</strong>
                <span>{comment.body}</span>
                <small>
                  {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
                </small>
              </button>
            ))
          ) : (
            <p>Chưa có bình luận công khai.</p>
          )}
        </section>
      </div>
    </main>
  );
}
