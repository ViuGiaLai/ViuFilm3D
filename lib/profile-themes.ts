import { getCultivation } from "@/lib/cultivation";

export type ProfileThemeConfig = {
  id: string;
  caveName: string;
  badgeText: string;
  poeticLine: string;
  primaryColor: string;
  accentColor: string;
  glowColor: string;
  glowStrong: string;
  borderColor: string;
  panelTint: string;
  cardBorder: string;
  bgGradient: string;
  // Light mode specific palette
  bgGradientLight: string;
  panelTintLight: string;
  glowLight: string;
  borderLight: string;
  motifType:
    | "qilin"
    | "dragon"
    | "phoenix"
    | "tiger"
    | "turtle"
    | "fox"
    | "stars"
    | "swords"
    | "formation"
    | "yin-yang"
    | "lotus"
    | "fire"
    | "ice"
    | "water"
    | "wind"
    | "thunder"
    | "shadow"
    | "light"
    | "journey"
    | "devoted"
    | "companion"
    | "beginner"
    | "celestial-emperor"
    | "cultivation";
};

// Preset themes for all frame IDs
export const profileThemes: Record<string, ProfileThemeConfig> = {
  // =========================================================================
  // LINH THÚ (MYTHICAL BEASTS)
  // =========================================================================
  qilin: {
    id: "qilin",
    caveName: "KỲ LÂN THÁNH ĐIỆN",
    badgeText: "HOÀNG CỰC THỤY THÚ",
    poeticLine: "Thánh Đức Cát Tường · Ngũ Sắc Tường Vân",
    primaryColor: "#f59e0b",
    accentColor: "#fde047",
    glowColor: "rgba(245, 158, 11, 0.45)",
    glowStrong: "rgba(251, 191, 36, 0.75)",
    borderColor: "rgba(245, 158, 11, 0.4)",
    panelTint: "rgba(38, 22, 5, 0.88)",
    cardBorder: "rgba(245, 158, 11, 0.22)",
    bgGradient: "linear-gradient(135deg, #1f1003 0%, #3d2105 45%, #613409 75%, #1c0e02 100%)",
    bgGradientLight: "linear-gradient(135deg, #fefce8 0%, #fef08a 35%, #f59e0b 80%, #b45309 100%)",
    panelTintLight: "rgba(254, 240, 138, 0.45)",
    glowLight: "rgba(245, 158, 11, 0.25)",
    borderLight: "rgba(245, 158, 11, 0.35)",
    motifType: "qilin",
  },
  dragon: {
    id: "dragon",
    caveName: "THANH LONG BÀN HẢI",
    badgeText: "ẤT MỘC THẦN LONG",
    poeticLine: "Thần Long Bàn Triều · Ngũ Trảo Tụ Lôi",
    primaryColor: "#10b981",
    accentColor: "#6ee7b7",
    glowColor: "rgba(16, 185, 129, 0.45)",
    glowStrong: "rgba(52, 211, 153, 0.75)",
    borderColor: "rgba(16, 185, 129, 0.4)",
    panelTint: "rgba(4, 30, 22, 0.88)",
    cardBorder: "rgba(16, 185, 129, 0.22)",
    bgGradient: "linear-gradient(135deg, #021a14 0%, #06382b 45%, #0d5440 75%, #01140f 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0fdf4 0%, #a7f3d0 35%, #10b981 80%, #047857 100%)",
    panelTintLight: "rgba(167, 243, 208, 0.45)",
    glowLight: "rgba(16, 185, 129, 0.25)",
    borderLight: "rgba(16, 185, 129, 0.35)",
    motifType: "dragon",
  },
  phoenix: {
    id: "phoenix",
    caveName: "CHU TƯỚC NIẾT BÀN",
    badgeText: "BẤT DIỆT HỎA CUNG",
    poeticLine: "Niết Bàn Chân Hỏa · Phượng Hoàng Tề Minh",
    primaryColor: "#f97316",
    accentColor: "#ef4444",
    glowColor: "rgba(249, 115, 22, 0.5)",
    glowStrong: "rgba(249, 115, 22, 0.8)",
    borderColor: "rgba(249, 115, 22, 0.42)",
    panelTint: "rgba(36, 12, 5, 0.88)",
    cardBorder: "rgba(249, 115, 22, 0.22)",
    bgGradient: "linear-gradient(135deg, #240803 0%, #4a1306 45%, #6e1c09 75%, #1c0502 100%)",
    bgGradientLight: "linear-gradient(135deg, #fff1f2 0%, #fecdd3 35%, #f97316 80%, #c2410c 100%)",
    panelTintLight: "rgba(254, 205, 211, 0.45)",
    glowLight: "rgba(249, 115, 22, 0.25)",
    borderLight: "rgba(249, 115, 22, 0.35)",
    motifType: "phoenix",
  },
  tiger: {
    id: "tiger",
    caveName: "BẠCH HỔ PHONG VÂN",
    badgeText: "CANH KIM SÁT ĐIỆN",
    poeticLine: "Canh Kim Sát Khí · Hổ Khiếu Thiên Địa",
    primaryColor: "#cbd5e1",
    accentColor: "#f59e0b",
    glowColor: "rgba(248, 250, 252, 0.4)",
    glowStrong: "rgba(248, 250, 252, 0.7)",
    borderColor: "rgba(203, 213, 225, 0.35)",
    panelTint: "rgba(20, 26, 38, 0.88)",
    cardBorder: "rgba(203, 213, 225, 0.2)",
    bgGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #334155 75%, #090d16 100%)",
    bgGradientLight: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 35%, #94a3b8 80%, #475569 100%)",
    panelTintLight: "rgba(226, 232, 240, 0.5)",
    glowLight: "rgba(148, 163, 184, 0.25)",
    borderLight: "rgba(148, 163, 184, 0.35)",
    motifType: "tiger",
  },
  turtle: {
    id: "turtle",
    caveName: "HUYỀN VŨ BẮC MINH",
    badgeText: "THẦN QUY HẢI VỰC",
    poeticLine: "Bắc Minh Chân Võ · Quy Xà Bất Diệt",
    primaryColor: "#14b8a6",
    accentColor: "#5eead4",
    glowColor: "rgba(20, 184, 166, 0.45)",
    glowStrong: "rgba(45, 212, 191, 0.75)",
    borderColor: "rgba(20, 184, 166, 0.38)",
    panelTint: "rgba(4, 38, 36, 0.88)",
    cardBorder: "rgba(20, 184, 166, 0.22)",
    bgGradient: "linear-gradient(135deg, #032120 0%, #063d3b 45%, #0c5653 75%, #021716 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0fdfa 0%, #99f6e4 35%, #14b8a6 80%, #0f766e 100%)",
    panelTintLight: "rgba(153, 246, 228, 0.45)",
    glowLight: "rgba(20, 184, 166, 0.25)",
    borderLight: "rgba(20, 184, 166, 0.35)",
    motifType: "turtle",
  },
  fox: {
    id: "fox",
    caveName: "CỬU VĨ HỒ LINH",
    badgeText: "THANH KHÂU TIÊN CẢNH",
    poeticLine: "Thanh Khâu Mị Ảnh · Linh Hoa Bát Ngát",
    primaryColor: "#f472b6",
    accentColor: "#ec4899",
    glowColor: "rgba(244, 114, 182, 0.45)",
    glowStrong: "rgba(244, 114, 182, 0.75)",
    borderColor: "rgba(244, 114, 182, 0.38)",
    panelTint: "rgba(38, 8, 24, 0.88)",
    cardBorder: "rgba(244, 114, 182, 0.22)",
    bgGradient: "linear-gradient(135deg, #240716 0%, #450c2b 45%, #661340 75%, #1a040f 100%)",
    bgGradientLight: "linear-gradient(135deg, #fdf2f8 0%, #fbcfe8 35%, #f472b6 80%, #be185d 100%)",
    panelTintLight: "rgba(251, 207, 232, 0.45)",
    glowLight: "rgba(244, 114, 182, 0.25)",
    borderLight: "rgba(244, 114, 182, 0.35)",
    motifType: "fox",
  },

  // =========================================================================
  // ĐẶC BIỆT (SPECIAL ARTIFACTS)
  // =========================================================================
  stars: {
    id: "stars",
    caveName: "VÔ TẬN TINH HÀ",
    badgeText: "HỖN ĐỘN VẠN GIỚI",
    poeticLine: "Hỗn Độn Vạn Giới · Tinh Đấu Vĩnh Hằng",
    primaryColor: "#a855f7",
    accentColor: "#38bdf8",
    glowColor: "rgba(168, 85, 247, 0.5)",
    glowStrong: "rgba(192, 132, 252, 0.8)",
    borderColor: "rgba(168, 85, 247, 0.42)",
    panelTint: "rgba(24, 9, 45, 0.88)",
    cardBorder: "rgba(168, 85, 247, 0.24)",
    bgGradient: "linear-gradient(135deg, #0d051f 0%, #1d0b3d 45%, #301363 75%, #080314 100%)",
    bgGradientLight: "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 35%, #a855f7 80%, #6b21a8 100%)",
    panelTintLight: "rgba(233, 213, 255, 0.45)",
    glowLight: "rgba(168, 85, 247, 0.25)",
    borderLight: "rgba(168, 85, 247, 0.35)",
    motifType: "stars",
  },
  swords: {
    id: "swords",
    caveName: "VẠN KIẾM QUY TÔNG",
    badgeText: "THẦN KIẾM TIÊN CUNG",
    poeticLine: "Bát Đại Tiên Kiếm · Trảm Toạc Hư Không",
    primaryColor: "#38bdf8",
    accentColor: "#0284c7",
    glowColor: "rgba(56, 189, 248, 0.5)",
    glowStrong: "rgba(56, 189, 248, 0.8)",
    borderColor: "rgba(56, 189, 248, 0.4)",
    panelTint: "rgba(7, 28, 48, 0.88)",
    cardBorder: "rgba(56, 189, 248, 0.22)",
    bgGradient: "linear-gradient(135deg, #04192b 0%, #083354 45%, #0d4b7a 75%, #021221 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0f9ff 0%, #bae6fd 35%, #38bdf8 80%, #0369a1 100%)",
    panelTintLight: "rgba(186, 230, 253, 0.45)",
    glowLight: "rgba(56, 189, 248, 0.25)",
    borderLight: "rgba(56, 189, 248, 0.35)",
    motifType: "swords",
  },
  formation: {
    id: "formation",
    caveName: "CHU THIÊN TINH ĐẤU",
    badgeText: "THẦN CƠ ĐẠI TRẬN",
    poeticLine: "Thần Cơ Pháp Trận · Vạn Phù Quy Nhất",
    primaryColor: "#c084fc",
    accentColor: "#fde047",
    glowColor: "rgba(192, 132, 252, 0.5)",
    glowStrong: "rgba(192, 132, 252, 0.8)",
    borderColor: "rgba(192, 132, 252, 0.42)",
    panelTint: "rgba(28, 14, 46, 0.88)",
    cardBorder: "rgba(192, 132, 252, 0.22)",
    bgGradient: "linear-gradient(135deg, #130824 0%, #29114d 45%, #421a7a 75%, #0d0519 100%)",
    bgGradientLight: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 35%, #c084fc 80%, #7e22ce 100%)",
    panelTintLight: "rgba(243, 232, 255, 0.45)",
    glowLight: "rgba(192, 132, 252, 0.25)",
    borderLight: "rgba(192, 132, 252, 0.35)",
    motifType: "formation",
  },
  "yin-yang": {
    id: "yin-yang",
    caveName: "THÁI CỰC ĐẠO PHỦ",
    badgeText: "BÁT QUÁI THẦN ĐIỆN",
    poeticLine: "Âm Dương Hòa Hợp · Vạn Vật Hóa Sinh",
    primaryColor: "#fbbf24",
    accentColor: "#818cf8",
    glowColor: "rgba(251, 191, 36, 0.45)",
    glowStrong: "rgba(251, 191, 36, 0.75)",
    borderColor: "rgba(251, 191, 36, 0.38)",
    panelTint: "rgba(30, 24, 14, 0.88)",
    cardBorder: "rgba(251, 191, 36, 0.2)",
    bgGradient: "linear-gradient(135deg, #14131c 0%, #252238 45%, #3d3557 75%, #0d0c14 100%)",
    bgGradientLight: "linear-gradient(135deg, #f8fafc 0%, #fef3c7 35%, #fbbf24 80%, #b45309 100%)",
    panelTintLight: "rgba(254, 243, 199, 0.45)",
    glowLight: "rgba(251, 191, 36, 0.25)",
    borderLight: "rgba(251, 191, 36, 0.35)",
    motifType: "yin-yang",
  },
  lotus: {
    id: "lotus",
    caveName: "HỖN ĐỘN LIÊN ĐÀI",
    badgeText: "TỊNH THẾ TIÊN TRÌ",
    poeticLine: "Tịnh Thế Hồng Liên · Thanh Lọc Tâm Ma",
    primaryColor: "#fb7185",
    accentColor: "#fda4af",
    glowColor: "rgba(251, 113, 133, 0.45)",
    glowStrong: "rgba(251, 113, 133, 0.75)",
    borderColor: "rgba(251, 113, 133, 0.38)",
    panelTint: "rgba(36, 10, 20, 0.88)",
    cardBorder: "rgba(251, 113, 133, 0.2)",
    bgGradient: "linear-gradient(135deg, #240815 0%, #47112b 45%, #66183f 75%, #17050e 100%)",
    bgGradientLight: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 35%, #fb7185 80%, #be123c 100%)",
    panelTintLight: "rgba(255, 228, 230, 0.45)",
    glowLight: "rgba(251, 113, 133, 0.25)",
    borderLight: "rgba(251, 113, 133, 0.35)",
    motifType: "lotus",
  },

  // =========================================================================
  // ĐẠO HẠNH (SENIORITY)
  // =========================================================================
  journey: {
    id: "journey",
    caveName: "CỬU TIÊU THÁI HOÀNG",
    badgeText: "VẠN CỔ TIÊN LỘ",
    poeticLine: "Tiên Lộ Dài Lâu · Vạn Cổ Trường Tồn",
    primaryColor: "#fbbf24",
    accentColor: "#f59e0b",
    glowColor: "rgba(251, 191, 36, 0.55)",
    glowStrong: "rgba(251, 191, 36, 0.85)",
    borderColor: "rgba(251, 191, 36, 0.45)",
    panelTint: "rgba(38, 26, 6, 0.88)",
    cardBorder: "rgba(251, 191, 36, 0.25)",
    bgGradient: "linear-gradient(135deg, #241302 0%, #452405 45%, #693808 75%, #170c01 100%)",
    bgGradientLight: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #f59e0b 80%, #b45309 100%)",
    panelTintLight: "rgba(254, 243, 199, 0.5)",
    glowLight: "rgba(245, 158, 11, 0.25)",
    borderLight: "rgba(245, 158, 11, 0.35)",
    motifType: "journey",
  },
  devoted: {
    id: "devoted",
    caveName: "TỬ KIM TIÊN MIỆN",
    badgeText: "ĐẾ TÔN THẦN PHỦ",
    poeticLine: "Đạo Hữu Bền Bỉ · Tử Khí Đông Lai",
    primaryColor: "#c084fc",
    accentColor: "#eab308",
    glowColor: "rgba(192, 132, 252, 0.45)",
    glowStrong: "rgba(192, 132, 252, 0.75)",
    borderColor: "rgba(192, 132, 252, 0.38)",
    panelTint: "rgba(30, 16, 42, 0.88)",
    cardBorder: "rgba(192, 132, 252, 0.2)",
    bgGradient: "linear-gradient(135deg, #170826 0%, #30114f 45%, #4a197a 75%, #10051a 100%)",
    bgGradientLight: "linear-gradient(135deg, #faf5ff 0%, #ede9fe 35%, #c084fc 80%, #6b21a8 100%)",
    panelTintLight: "rgba(237, 233, 254, 0.45)",
    glowLight: "rgba(192, 132, 252, 0.25)",
    borderLight: "rgba(192, 132, 252, 0.35)",
    motifType: "devoted",
  },
  companion: {
    id: "companion",
    caveName: "LAM TINH HẠC VŨ",
    badgeText: "TIÊN GIA BÍ CẢNH",
    poeticLine: "Đồng Hành Bát Ngát · Phiêu Diêu Mây Ngàn",
    primaryColor: "#38bdf8",
    accentColor: "#60a5fa",
    glowColor: "rgba(56, 189, 248, 0.45)",
    glowStrong: "rgba(56, 189, 248, 0.75)",
    borderColor: "rgba(56, 189, 248, 0.35)",
    panelTint: "rgba(8, 25, 42, 0.88)",
    cardBorder: "rgba(56, 189, 248, 0.2)",
    bgGradient: "linear-gradient(135deg, #061929 0%, #0e3352 45%, #144975 75%, #04121f 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 35%, #38bdf8 80%, #0369a1 100%)",
    panelTintLight: "rgba(224, 242, 254, 0.45)",
    glowLight: "rgba(56, 189, 248, 0.25)",
    borderLight: "rgba(56, 189, 248, 0.35)",
    motifType: "companion",
  },
  beginner: {
    id: "beginner",
    caveName: "THANH MỘC TIÊN VIÊN",
    badgeText: "LINH THẢO SƠ PHỦ",
    poeticLine: "Nhập Môn Sơ Ngộ · Linh Mộc Đâm Chồi",
    primaryColor: "#34d399",
    accentColor: "#10b981",
    glowColor: "rgba(52, 211, 153, 0.4)",
    glowStrong: "rgba(52, 211, 153, 0.7)",
    borderColor: "rgba(52, 211, 153, 0.35)",
    panelTint: "rgba(6, 32, 22, 0.88)",
    cardBorder: "rgba(52, 211, 153, 0.2)",
    bgGradient: "linear-gradient(135deg, #031c13 0%, #073b29 45%, #0c573d 75%, #02140d 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 35%, #34d399 80%, #047857 100%)",
    panelTintLight: "rgba(220, 252, 231, 0.45)",
    glowLight: "rgba(52, 211, 153, 0.25)",
    borderLight: "rgba(52, 211, 153, 0.35)",
    motifType: "beginner",
  },

  // =========================================================================
  // NGUYÊN TỐ (ELEMENTS)
  // =========================================================================
  fire: {
    id: "fire",
    caveName: "TAM MUỘI HỎA PHỦ",
    badgeText: "LIỆT DIỄM ĐỘNG THIÊN",
    poeticLine: "Chân Hỏa Phần Thiên · Luyện Thể Đạo Môn",
    primaryColor: "#f97316",
    accentColor: "#ef4444",
    glowColor: "rgba(249, 115, 22, 0.5)",
    glowStrong: "rgba(249, 115, 22, 0.8)",
    borderColor: "rgba(249, 115, 22, 0.4)",
    panelTint: "rgba(38, 12, 5, 0.88)",
    cardBorder: "rgba(249, 115, 22, 0.22)",
    bgGradient: "linear-gradient(135deg, #240803 0%, #471206 45%, #6e1d09 75%, #1a0502 100%)",
    bgGradientLight: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 30%, #fb923c 75%, #c2410c 100%)",
    panelTintLight: "rgba(255, 237, 213, 0.5)",
    glowLight: "rgba(249, 115, 22, 0.25)",
    borderLight: "rgba(249, 115, 22, 0.35)",
    motifType: "fire",
  },
  ice: {
    id: "ice",
    caveName: "HÀN BĂNG THẦN CUNG",
    badgeText: "VẠN NIÊN PHÁCH ĐIỆN",
    poeticLine: "Băng Phách Huyền Tinh · Đóng Băng Vạn Dặm",
    primaryColor: "#38bdf8",
    accentColor: "#bae6fd",
    glowColor: "rgba(56, 189, 248, 0.45)",
    glowStrong: "rgba(56, 189, 248, 0.75)",
    borderColor: "rgba(56, 189, 248, 0.38)",
    panelTint: "rgba(7, 26, 44, 0.88)",
    cardBorder: "rgba(56, 189, 248, 0.2)",
    bgGradient: "linear-gradient(135deg, #051a2b 0%, #0c3554 45%, #134e7a 75%, #031221 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 35%, #38bdf8 80%, #0284c7 100%)",
    panelTintLight: "rgba(224, 242, 254, 0.45)",
    glowLight: "rgba(56, 189, 248, 0.25)",
    borderLight: "rgba(56, 189, 248, 0.35)",
    motifType: "ice",
  },
  water: {
    id: "water",
    caveName: "THỦY NGUYỆT TIÊN ĐẦM",
    badgeText: "THÁI HƯ BÍ CẢNH",
    poeticLine: "Thủy Nguyệt Kính Hoa · Trăng Rọi Đầm Sâu",
    primaryColor: "#0ea5e9",
    accentColor: "#7dd3fc",
    glowColor: "rgba(14, 165, 233, 0.45)",
    glowStrong: "rgba(14, 165, 233, 0.75)",
    borderColor: "rgba(14, 165, 233, 0.38)",
    panelTint: "rgba(6, 25, 42, 0.88)",
    cardBorder: "rgba(14, 165, 233, 0.2)",
    bgGradient: "linear-gradient(135deg, #041a29 0%, #093352 45%, #0f4b78 75%, #03131f 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0f9ff 0%, #bae6fd 35%, #0ea5e9 80%, #0369a1 100%)",
    panelTintLight: "rgba(186, 230, 253, 0.45)",
    glowLight: "rgba(14, 165, 233, 0.25)",
    borderLight: "rgba(14, 165, 233, 0.35)",
    motifType: "water",
  },
  wind: {
    id: "wind",
    caveName: "CỬU TIÊU PHONG VỰC",
    badgeText: "THÁI HƯ PHONG ĐIỆN",
    poeticLine: "Phong Linh Vạn Dặm · Tiêu Dao Thiên Ngoại",
    primaryColor: "#34d399",
    accentColor: "#2dd4bf",
    glowColor: "rgba(52, 211, 153, 0.45)",
    glowStrong: "rgba(52, 211, 153, 0.75)",
    borderColor: "rgba(52, 211, 153, 0.38)",
    panelTint: "rgba(6, 32, 24, 0.88)",
    cardBorder: "rgba(52, 211, 153, 0.2)",
    bgGradient: "linear-gradient(135deg, #031c14 0%, #073b2a 45%, #0c573e 75%, #02140e 100%)",
    bgGradientLight: "linear-gradient(135deg, #f0fdf4 0%, #ccfbf1 35%, #34d399 80%, #0f766e 100%)",
    panelTintLight: "rgba(204, 251, 241, 0.45)",
    glowLight: "rgba(52, 211, 153, 0.25)",
    borderLight: "rgba(52, 211, 153, 0.35)",
    motifType: "wind",
  },
  thunder: {
    id: "thunder",
    caveName: "TỬ TIÊU LÔI ĐIỆN",
    badgeText: "CỬU THIÊN THẦN VỰC",
    poeticLine: "Thiên Kiếp Thần Lôi · Phạt Tội Càn Khôn",
    primaryColor: "#a855f7",
    accentColor: "#fde047",
    glowColor: "rgba(168, 85, 247, 0.55)",
    glowStrong: "rgba(168, 85, 247, 0.85)",
    borderColor: "rgba(168, 85, 247, 0.45)",
    panelTint: "rgba(28, 10, 48, 0.88)",
    cardBorder: "rgba(168, 85, 247, 0.24)",
    bgGradient: "linear-gradient(135deg, #130424 0%, #280a4a 45%, #42117a 75%, #0d0219 100%)",
    bgGradientLight: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 35%, #a855f7 80%, #581c87 100%)",
    panelTintLight: "rgba(243, 232, 255, 0.45)",
    glowLight: "rgba(168, 85, 247, 0.25)",
    borderLight: "rgba(168, 85, 247, 0.35)",
    motifType: "thunder",
  },
  shadow: {
    id: "shadow",
    caveName: "CỬU U MA PHỦ",
    badgeText: "THÔN THIÊN MA VỰC",
    poeticLine: "Thôn Thiên Ma Vực · U Minh Vạn Kiếp",
    primaryColor: "#9333ea",
    accentColor: "#f43f5e",
    glowColor: "rgba(147, 51, 234, 0.55)",
    glowStrong: "rgba(147, 51, 234, 0.85)",
    borderColor: "rgba(147, 51, 234, 0.45)",
    panelTint: "rgba(30, 8, 44, 0.88)",
    cardBorder: "rgba(147, 51, 234, 0.24)",
    bgGradient: "linear-gradient(135deg, #170424 0%, #2f0847 45%, #4c0d70 75%, #10021a 100%)",
    bgGradientLight: "linear-gradient(135deg, #faf5ff 0%, #e9d5ff 35%, #9333ea 80%, #4c0519 100%)",
    panelTintLight: "rgba(233, 213, 255, 0.45)",
    glowLight: "rgba(147, 51, 234, 0.25)",
    borderLight: "rgba(147, 51, 234, 0.35)",
    motifType: "shadow",
  },
  light: {
    id: "light",
    caveName: "THÁI DƯƠNG THÁNH ĐIỆN",
    badgeText: "THÁI CỔ TIÊN CUNG",
    poeticLine: "Thánh Quang Vạn Trượng · Chiếu Rọi Tam Giới",
    primaryColor: "#facc15",
    accentColor: "#fef08a",
    glowColor: "rgba(250, 204, 21, 0.55)",
    glowStrong: "rgba(250, 204, 21, 0.85)",
    borderColor: "rgba(250, 204, 21, 0.45)",
    panelTint: "rgba(38, 28, 5, 0.88)",
    cardBorder: "rgba(250, 204, 21, 0.25)",
    bgGradient: "linear-gradient(135deg, #241903 0%, #453106 45%, #694a08 75%, #171001 100%)",
    bgGradientLight: "linear-gradient(135deg, #fefce8 0%, #fef08a 35%, #facc15 80%, #a16207 100%)",
    panelTintLight: "rgba(254, 240, 138, 0.5)",
    glowLight: "rgba(250, 204, 21, 0.25)",
    borderLight: "rgba(250, 204, 21, 0.35)",
    motifType: "light",
  },

  // =========================================================================
  // TIÊN ĐẾ (REALM-14) & CÁC CẢNH GIỚI ĐỈNH CAO
  // =========================================================================
  "realm-14": {
    id: "realm-14",
    caveName: "TIÊN ĐẾ CHÍ TÔN",
    badgeText: "CỬU TIÊU THIÊN ĐÌNH",
    poeticLine: "Vạn Cổ Độc Tôn · Chư Thiên Quy Phục",
    primaryColor: "#ffd700",
    accentColor: "#fde047",
    glowColor: "rgba(255, 215, 0, 0.65)",
    glowStrong: "rgba(255, 215, 0, 0.95)",
    borderColor: "rgba(255, 215, 0, 0.5)",
    panelTint: "rgba(42, 28, 6, 0.92)",
    cardBorder: "rgba(255, 215, 0, 0.3)",
    bgGradient: "linear-gradient(135deg, #2b1802 0%, #522d03 45%, #7a4305 75%, #1e1001 100%)",
    bgGradientLight: "linear-gradient(135deg, #fffbeb 0%, #fef08a 35%, #eab308 75%, #a16207 100%)",
    panelTintLight: "rgba(254, 240, 138, 0.55)",
    glowLight: "rgba(234, 179, 8, 0.35)",
    borderLight: "rgba(202, 138, 4, 0.45)",
    motifType: "celestial-emperor",
  },
};

/**
 * Resolves the appropriate profile theme based on the user's avatar frame or cultivation XP
 */
export function resolveProfileTheme(
  frameId: string | null | undefined,
  cultivationXp: number,
): ProfileThemeConfig {
  // If frameId is specified and known, use it
  if (frameId && frameId !== "none" && profileThemes[frameId]) {
    return profileThemes[frameId];
  }

  // If frameId is a realm (e.g. realm-14)
  if (frameId && profileThemes[frameId]) {
    return profileThemes[frameId];
  }

  // Derive realm from cultivation XP
  const { realmIndex, realm } = getCultivation(cultivationXp);

  // If Tiên Đế
  if (realmIndex >= 14) {
    return profileThemes["realm-14"];
  }

  // Dynamic cultivation cave theme
  const isHigh = realmIndex >= 10;
  const isMid = realmIndex >= 5;

  return {
    id: `realm-${realmIndex}`,
    caveName: `ĐỘNG PHỦ · ${realm.toUpperCase()}`,
    badgeText: "TIÊN GIA ĐẠO LỘ",
    poeticLine: `${realm} Linh Cảnh · Vân Sơn Tụ Khí`,
    primaryColor: isHigh ? "#fbbf24" : isMid ? "#a855f7" : "#38bdf8",
    accentColor: isHigh ? "#fde047" : isMid ? "#c084fc" : "#7dd3fc",
    glowColor: isHigh
      ? "rgba(251, 191, 36, 0.45)"
      : isMid
        ? "rgba(168, 85, 247, 0.4)"
        : "rgba(56, 189, 248, 0.35)",
    glowStrong: isHigh
      ? "rgba(251, 191, 36, 0.75)"
      : isMid
        ? "rgba(168, 85, 247, 0.7)"
        : "rgba(56, 189, 248, 0.65)",
    borderColor: isHigh
      ? "rgba(251, 191, 36, 0.38)"
      : isMid
        ? "rgba(168, 85, 247, 0.35)"
        : "rgba(56, 189, 248, 0.3)",
    panelTint: isHigh
      ? "rgba(35, 24, 6, 0.88)"
      : isMid
        ? "rgba(24, 10, 38, 0.88)"
        : "rgba(8, 24, 38, 0.88)",
    cardBorder: isHigh
      ? "rgba(251, 191, 36, 0.2)"
      : isMid
        ? "rgba(168, 85, 247, 0.18)"
        : "rgba(56, 189, 248, 0.16)",
    bgGradient: isHigh
      ? "linear-gradient(135deg, #1c1002 0%, #361f04 45%, #523006 75%, #140b01 100%)"
      : isMid
        ? "linear-gradient(135deg, #120521 0%, #230b40 45%, #381263 75%, #0b0314 100%)"
        : "linear-gradient(135deg, #071926 0%, #0f2e47 45%, #154266 75%, #04101c 100%)",
    bgGradientLight: isHigh
      ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #f59e0b 80%, #b45309 100%)"
      : isMid
        ? "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 35%, #c084fc 80%, #7e22ce 100%)"
        : "linear-gradient(135deg, #f0f9ff 0%, #bae6fd 35%, #38bdf8 80%, #0369a1 100%)",
    panelTintLight: isHigh
      ? "rgba(254, 243, 199, 0.45)"
      : isMid
        ? "rgba(243, 232, 255, 0.45)"
        : "rgba(186, 230, 253, 0.45)",
    glowLight: isHigh
      ? "rgba(245, 158, 11, 0.25)"
      : isMid
        ? "rgba(168, 85, 247, 0.22)"
        : "rgba(56, 189, 248, 0.22)",
    borderLight: isHigh
      ? "rgba(245, 158, 11, 0.35)"
      : isMid
        ? "rgba(168, 85, 247, 0.3)"
        : "rgba(56, 189, 248, 0.3)",
    motifType: "cultivation",
  };
}
