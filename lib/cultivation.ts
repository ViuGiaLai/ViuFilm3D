// Hệ thống cảnh giới riêng của ViuFilm3D, lấy cảm hứng từ tiên hiệp.
// Tên và thứ tự cảnh giới khác nhau giữa các tác phẩm.
export const cultivationRealms = [
  {
    name: "Phàm Nhân",
    start: 0,
    description: "Bắt đầu tiên lộ, tích lũy những đạo hạnh đầu tiên.",
  },
  {
    name: "Luyện Khí",
    start: 40,
    description: "Bắt đầu tụ linh khí, mở đường tu luyện.",
  },
  {
    name: "Trúc Cơ",
    start: 80,
    description: "Xây nền đạo cơ, linh lực dần ổn định.",
  },
  {
    name: "Kết Đan",
    start: 200,
    description: "Ngưng tụ nội đan, tăng sức bền linh lực.",
  },
  {
    name: "Nguyên Anh",
    start: 380,
    description: "Nguyên thần sơ thành, thần thức mở rộng.",
  },
  {
    name: "Hóa Thần",
    start: 640,
    description: "Thần thức tinh luyện, lĩnh ngộ đạo pháp.",
  },
  {
    name: "Luyện Hư",
    start: 980,
    description: "Hiểu sâu hư thực, tôi luyện nguyên thần.",
  },
  {
    name: "Hợp Thể",
    start: 1420,
    description: "Thân và thần hợp nhất, đạo cơ vững chắc.",
  },
  {
    name: "Đại Thừa",
    start: 1980,
    description: "Tích lũy đạo hạnh trước đại kiếp.",
  },
  {
    name: "Độ Kiếp",
    start: 2700,
    description: "Đối diện thiên kiếp, tôi luyện đạo tâm.",
  },
  {
    name: "Huyền Kiếp",
    start: 3600,
    description: "Vượt huyền kiếp, rèn tâm và đạo hạnh.",
  },
  {
    name: "Dương Thực",
    start: 4800,
    description: "Dương thần vững vàng, tiến gần cảnh giới tiên.",
  },
  {
    name: "Phi Thăng",
    start: 6400,
    description: "Mở tiên môn, tiến vào tiên lộ mới.",
  },
  {
    name: "Chân Tiên",
    start: 8400,
    description: "Đạo tâm viên thành, tiên khí ngưng tụ.",
  },
  {
    name: "Tiên Đế",
    start: 11000,
    description: "Cảnh giới cao nhất của hệ thống ViuFilm3D.",
  },
] as const;

const phases = ["Sơ Kỳ", "Trung Kỳ", "Hậu Kỳ", "Viên Mãn"] as const;

export function getCultivation(xpValue: number) {
  const xp = Math.max(0, Math.floor(Number.isFinite(xpValue) ? xpValue : 0));
  const index = cultivationRealms.findLastIndex((realm) => xp >= realm.start);
  const realmIndex = Math.max(0, index);
  const realm = cultivationRealms[realmIndex];
  const nextRealm = cultivationRealms[realmIndex + 1];
  const span = nextRealm ? nextRealm.start - realm.start : 1200;
  const step = span / 4;
  const phaseIndex = Math.min(3, Math.floor((xp - realm.start) / step));
  const nextXp =
    phaseIndex < 3
      ? Math.ceil(realm.start + step * (phaseIndex + 1))
      : (nextRealm?.start ?? null);
  const currentStart = Math.ceil(realm.start + step * phaseIndex);
  const progress =
    nextXp === null
      ? 100
      : Math.max(
          0,
          Math.min(
            100,
            Math.round(((xp - currentStart) / (nextXp - currentStart)) * 100),
          ),
        );
  return {
    title: `${realm.name} ${phases[phaseIndex]}`,
    realm: realm.name,
    description: realm.description,
    realmIndex,
    xp,
    nextXp,
    progress,
  };
}
