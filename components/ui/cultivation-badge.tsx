import { cultivationRealms, getCultivation } from "@/lib/cultivation";

export function CultivationBadge({ xp = 0 }: { xp?: number }) {
  const rank = getCultivation(xp);
  return (
    <span
      className={`cultivation-badge cultivation-badge--${rank.realmIndex}`}
      title={`${rank.description} · ${rank.xp} đạo hạnh`}
    >
      <span aria-hidden="true">✦</span> {rank.title}
    </span>
  );
}

export function CultivationProgress({ xp = 0 }: { xp?: number }) {
  const rank = getCultivation(xp);
  return (
    <section className="cultivation-progress" aria-label="Cảnh giới tu luyện">
      <div className="cultivation-progress-top">
        <span>Cảnh giới hiện tại</span>
        <CultivationBadge xp={xp} />
      </div>
      <p>{rank.description}</p>
      <div
        className="cultivation-progress-track"
        role="progressbar"
        aria-valuenow={rank.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Tiến độ cảnh giới"
      >
        <span style={{ width: `${rank.progress}%` }} />
      </div>
      <small>
        {rank.xp} đạo hạnh
        {rank.nextXp !== null
          ? ` · còn ${rank.nextXp - rank.xp} để đột phá`
          : " · đã đạt đỉnh"}
      </small>
      <small>
        Bình luận đầu tiên mỗi phim trong ngày: +10 · xem ít nhất nửa phim: +20
        (mỗi phim một lần).
      </small>
      <details className="cultivation-path">
        <summary>Lộ trình cảnh giới và phần thưởng</summary>
        <p>
          Mỗi cảnh giới có Sơ Kỳ → Trung Kỳ → Hậu Kỳ → Viên Mãn. Đạo hạnh chỉ mở
          khóa huy hiệu và viền trang trí, không cấp quyền quản trị hay ưu tiên
          bình luận.
        </p>
        <ol>
          {cultivationRealms.map((realm) => (
            <li key={realm.name}>
              <strong>{realm.name}</strong>
              <span>
                {realm.start} đạo hạnh · mở viền {realm.name}
              </span>
              <small>{realm.description}</small>
            </li>
          ))}
        </ol>
        <small>
          Hệ thống riêng của ViuFilm3D, không phải bảng cảnh giới chuẩn của tất
          cả phim. Điểm xem áp dụng cho phim từ 2 phút trở lên. Đạo hạnh không
          quy đổi thành tiền.
        </small>
      </details>
    </section>
  );
}
