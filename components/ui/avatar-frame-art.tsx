"use client";

import { useId } from "react";

type AvatarFrameArtProps = {
  frameId: string;
  shape: "ring" | "rays" | "wings" | "jewel" | "runes";
  color: string;
  symbol: string;
  name: string;
};

export function AvatarFrameArt({
  frameId,
  shape,
  color,
  symbol,
  name,
}: AvatarFrameArtProps) {
  const uid = useId().replace(/:/g, "_");

  // Custom renders for each specific frame
  const renderFrameContent = () => {
    switch (frameId) {
      // =========================================================================
      // CẢNH GIỚI (CULTIVATION REALMS 1 TO 13) - TĂNG DẦN ĐỘ HOA LỆ VÀ NỔI BẬT
      // (realm-0 Phàm Nhân & realm-14 Tiên Đế được giữ nguyên theo yêu cầu)
      // =========================================================================

      // Cảnh giới 1: Luyện Khí (Sơ nhập tu chân, tụ khí sơ khai)
      case "realm-1":
        return (
          <g className="frame-art-realm-1">
            <defs>
              <linearGradient id={`grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#059669" />
              </linearGradient>
            </defs>
            {/* Vòng tụ khí xoay */}
            <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#grad_${uid})`} strokeWidth="2.5" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="5 3" className="avatar-anim-spin" />
            {/* 4 điểm tụ linh khí */}
            <circle cx="50" cy="3" r="2.2" fill="#a7f3d0" />
            <circle cx="97" cy="50" r="2.2" fill="#a7f3d0" />
            <circle cx="50" cy="97" r="2.2" fill="#a7f3d0" />
            <circle cx="3" cy="50" r="2.2" fill="#a7f3d0" />
            {/* Ấn ký Luyện Khí */}
            <circle cx="50" cy="92" r="7" fill="#064e3b" stroke="#34d399" strokeWidth="1.2" />
            <text x="50" y="95" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ecfdf5">气</text>
          </g>
        );

      // Cảnh giới 2: Trúc Cơ (Xây nền đạo cơ, lam ngọc bát giác)
      case "realm-2":
        return (
          <g className="frame-art-realm-2">
            <defs>
              <linearGradient id={`grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
            </defs>
            {/* Vòng nền lam ngọc */}
            <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#grad_${uid})`} strokeWidth="3" />
            <polygon points="50,3 83,17 97,50 83,83 50,97 17,83 3,50 17,17" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3 3" className="avatar-anim-spin-slow" />
            {/* 4 tinh thể đạo cơ */}
            <polygon points="50,1 53,6 50,10 47,6" fill="#cffafe" />
            <polygon points="99,50 94,53 90,50 94,47" fill="#cffafe" />
            <polygon points="50,99 47,94 50,90 53,94" fill="#cffafe" />
            <polygon points="1,50 6,47 10,50 6,53" fill="#cffafe" />
            {/* Ấn ký Trúc Cơ */}
            <circle cx="50" cy="91" r="7.5" fill="#155e75" stroke="#67e8f9" strokeWidth="1.5" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ecfeff">◇</text>
          </g>
        );

      // Cảnh giới 3: Kết Đan (Kim đan thành hình, hoàng kim sáng chói)
      case "realm-3":
        return (
          <g className="frame-art-realm-3">
            <defs>
              <linearGradient id={`gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
            </defs>
            {/* Vòng hoàng kim kép */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#gold_${uid})`} strokeWidth="2.8" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#fde047" strokeWidth="1" strokeDasharray="4 4" className="avatar-anim-spin" />
            {/* 8 hạt kim đan linh châu xoay quanh */}
            <g className="avatar-anim-spin-reverse">
              <circle cx="50" cy="2" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              <circle cx="84" cy="16" r="2.2" fill="#fde047" />
              <circle cx="98" cy="50" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              <circle cx="84" cy="84" r="2.2" fill="#fde047" />
              <circle cx="50" cy="98" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              <circle cx="16" cy="84" r="2.2" fill="#fde047" />
              <circle cx="2" cy="50" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              <circle cx="16" cy="16" r="2.2" fill="#fde047" />
            </g>
            {/* Ấn ký Kim Đan */}
            <circle cx="50" cy="91" r="8" fill="#713f12" stroke="#fef08a" strokeWidth="1.5" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fef9c3">丹</text>
          </g>
        );

      // Cảnh giới 4: Nguyên Anh (Tử linh nguyên anh, đóa sen tím nở rộ)
      case "realm-4":
        return (
          <g className="frame-art-realm-4">
            <defs>
              <linearGradient id={`purple_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e9d5ff" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#6b21a8" />
              </linearGradient>
            </defs>
            {/* Hào quang tím ma mị */}
            <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#purple_${uid})`} strokeWidth="3" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="8 4" className="avatar-anim-spin" />
            {/* Đóa hoa sen tím nâng đỡ đáy */}
            <path d="M35 91 Q42 84 50 86 Q58 84 65 91 Q58 97 50 96 Q42 97 35 91 Z" fill="#9333ea" stroke="#d8b4fe" strokeWidth="1" />
            <path d="M40 89 Q50 80 60 89 Z" fill="#c084fc" />
            {/* Tinh quang Nguyên Thần ở đỉnh */}
            <polygon points="50,0 52,6 58,8 52,10 50,16 48,10 42,8 48,6" fill="#f3e8ff" />
            {/* Ấn ký Nguyên Anh */}
            <circle cx="50" cy="90" r="7.5" fill="#4c1d95" stroke="#e9d5ff" strokeWidth="1.4" />
            <text x="50" y="93.5" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#faf5ff">✧</text>
          </g>
        );

      // Cảnh giới 5: Hóa Thần (Thần thức thông thiên, thần diễm bốc cao)
      case "realm-5":
        return (
          <g className="frame-art-realm-5">
            <defs>
              <linearGradient id={`mystic_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
            {/* Vòng thần thức xoay ngược chiều */}
            <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#mystic_${uid})`} strokeWidth="3.2" />
            <circle cx="50" cy="50" r="48.5" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeDasharray="3 6" className="avatar-anim-spin-reverse" />
            {/* 4 ngọn thần diễm ở 4 góc */}
            <path d="M15 15 Q10 8 18 10 Q14 16 15 15 Z" fill="#ec4899" />
            <path d="M85 15 Q90 8 82 10 Q86 16 85 15 Z" fill="#ec4899" />
            <path d="M85 85 Q90 92 82 90 Q86 84 85 85 Z" fill="#a855f7" />
            <path d="M15 85 Q10 92 18 90 Q14 84 15 85 Z" fill="#a855f7" />
            {/* Vương miện thần thức ở đỉnh */}
            <polygon points="50,2 54,9 62,6 56,12 50,10 44,12 38,6 46,9" fill="#fbcfe8" stroke="#db2777" strokeWidth="0.8" />
            {/* Ấn ký Hóa Thần */}
            <circle cx="50" cy="91" r="8" fill="#581c87" stroke="#f472b6" strokeWidth="1.5" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fdf2f8">神</text>
          </g>
        );

      // Cảnh giới 6: Luyện Hư (Thấu triệt hư thực, tinh vực bát quái)
      case "realm-6":
        return (
          <g className="frame-art-realm-6">
            <defs>
              <linearGradient id={`void_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93c5fd" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
            </defs>
            {/* Vòng hư không lam thẫm */}
            <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#void_${uid})`} strokeWidth="3.2" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="10 5" className="avatar-anim-spin" />
            {/* Bát quái hư không */}
            <g className="avatar-anim-spin-slow">
              <rect x="47" y="1" width="6" height="2" fill="#bfdbfe" />
              <rect x="47" y="97" width="6" height="2" fill="#bfdbfe" />
              <rect x="1" y="47" width="2" height="6" fill="#bfdbfe" />
              <rect x="97" y="47" width="2" height="6" fill="#bfdbfe" />
            </g>
            {/* Tinh tú vũ trụ */}
            <circle cx="20" cy="20" r="1.5" fill="#ffffff" />
            <circle cx="80" cy="20" r="1.8" fill="#93c5fd" />
            <circle cx="80" cy="80" r="1.5" fill="#ffffff" />
            <circle cx="20" cy="80" r="1.8" fill="#93c5fd" />
            {/* Ấn ký Luyện Hư */}
            <circle cx="50" cy="91" r="8" fill="#172554" stroke="#93c5fd" strokeWidth="1.6" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#eff6ff">虚</text>
          </g>
        );

      // Cảnh giới 7: Hợp Thể (Thân thần quy nhất, song long song phụng chầu ngọc)
      case "realm-7":
        return (
          <g className="frame-art-realm-7">
            <defs>
              <linearGradient id={`fusion_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fb7185" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
            {/* Vòng đôi hợp thể lộng lẫy */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#fusion_${uid})`} strokeWidth="3.5" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 3" className="avatar-anim-spin" />
            {/* Dải lụa tiên thiên 2 bên */}
            <path d="M5 35 Q-2 50 5 65 Q11 50 5 35 Z" fill="#fda4af" stroke="#e11d48" strokeWidth="1" />
            <path d="M95 35 Q102 50 95 65 Q89 50 95 35 Z" fill="#fda4af" stroke="#e11d48" strokeWidth="1" />
            {/* Kim liên nở rộ ở đỉnh đầu */}
            <polygon points="50,-1 54,6 60,3 56,10 50,8 44,10 40,3 46,6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            {/* Ấn ký Hợp Thể */}
            <circle cx="50" cy="91" r="8.5" fill="#881337" stroke="#fde047" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fff1f2">合</text>
          </g>
        );

      // Cảnh giới 8: Đại Thừa (Đại chu thiên bát quái thần trận, viên mãn trần thế)
      case "realm-8":
        return (
          <g className="frame-art-realm-8">
            <defs>
              <linearGradient id={`maha_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
            </defs>
            {/* Vòng bát quái đại thần trận */}
            <circle cx="50" cy="50" r="43" fill="none" stroke={`url(#maha_${uid})`} strokeWidth="3.8" />
            <circle cx="50" cy="50" r="48.5" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="8 4" className="avatar-anim-spin-slow" />
            {/* 8 tia hào quang mặt trời */}
            <g className="avatar-anim-spin">
              <polygon points="50,-2 52,4 48,4" fill="#fbbf24" />
              <polygon points="87,13 84,17 81,14" fill="#fbbf24" />
              <polygon points="102,50 96,52 96,48" fill="#fbbf24" />
              <polygon points="87,87 84,83 81,86" fill="#fbbf24" />
              <polygon points="50,102 48,96 52,96" fill="#fbbf24" />
              <polygon points="13,87 16,83 19,86" fill="#fbbf24" />
              <polygon points="-2,50 4,48 4,52" fill="#fbbf24" />
              <polygon points="13,13 16,17 19,14" fill="#fbbf24" />
            </g>
            {/* Vương miện Đại Thừa */}
            <path d="M38 6 L50 -2 L62 6 L56 12 L44 12 Z" fill="#fde047" stroke="#b45309" strokeWidth="1" />
            {/* Ấn ký Đại Thừa */}
            <circle cx="50" cy="91" r="8.5" fill="#451a03" stroke="#fef08a" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fef3c7">✶</text>
          </g>
        );

      // Cảnh giới 9: Độ Kiếp (Cửu Trọng Lôi Kiếp cuồn cuộn dữ dội)
      case "realm-9":
        return (
          <g className="frame-art-realm-9">
            <defs>
              <linearGradient id={`thunder_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bfdbfe" />
                <stop offset="40%" stopColor="#60a5fa" />
                <stop offset="70%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
            </defs>
            {/* Vòng lôi điện cuộn sóng */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#thunder_grad_${uid})`} strokeWidth="3.6" />
            {/* Tia sét chớp quanh viền */}
            <path d="M50 0 L53 10 L48 13 L55 22 L49 22" fill="none" stroke="#93c5fd" strokeWidth="1.8" className="avatar-anim-flash" />
            <path d="M100 50 L90 53 L87 48 L78 55 L78 49" fill="none" stroke="#93c5fd" strokeWidth="1.8" className="avatar-anim-flash" />
            <path d="M0 50 L10 47 L13 52 L22 45 L22 51" fill="none" stroke="#93c5fd" strokeWidth="1.8" className="avatar-anim-flash" />
            {/* Lôi cầu xoay quanh */}
            <circle cx="50" cy="50" r="49" fill="none" stroke="#c7d2fe" strokeWidth="1.2" strokeDasharray="3 7" className="avatar-anim-spin" />
            {/* 4 quả cầu sấm sét */}
            <circle cx="15" cy="15" r="3.2" fill="#bfdbfe" stroke="#3730a3" strokeWidth="1" className="avatar-anim-pulse" />
            <circle cx="85" cy="15" r="3.2" fill="#bfdbfe" stroke="#3730a3" strokeWidth="1" className="avatar-anim-pulse" />
            <circle cx="85" cy="85" r="3.2" fill="#bfdbfe" stroke="#3730a3" strokeWidth="1" className="avatar-anim-pulse" />
            <circle cx="15" cy="85" r="3.2" fill="#bfdbfe" stroke="#3730a3" strokeWidth="1" className="avatar-anim-pulse" />
            {/* Ấn ký Độ Kiếp */}
            <circle cx="50" cy="91" r="8.5" fill="#1e1b4b" stroke="#93c5fd" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#e0e7ff">ϟ</text>
          </g>
        );

      // Cảnh giới 10: Huyền Kiếp (Niết bàn chân hỏa đan xen hắc lôi)
      case "realm-10":
        return (
          <g className="frame-art-realm-10">
            <defs>
              <linearGradient id={`huyen_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="70%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>
            {/* Vòng chân hỏa niết bàn */}
            <circle cx="50" cy="50" r="43" fill="none" stroke={`url(#huyen_grad_${uid})`} strokeWidth="4" />
            {/* 8 ngọn thần hỏa vươn dài */}
            <path d="M50 -4 Q55 6 45 7 Q52 1 50 -4 Z" fill="#fbbf24" />
            <path d="M88 12 Q82 22 75 16 Q84 14 88 12 Z" fill="#f97316" />
            <path d="M104 50 Q94 55 93 45 Q99 52 104 50 Z" fill="#fbbf24" />
            <path d="M88 88 Q78 82 84 75 Q86 84 88 88 Z" fill="#f97316" />
            <path d="M-4 50 Q6 45 7 55 Q1 48 -4 50 Z" fill="#fbbf24" />
            <path d="M12 12 Q22 18 16 25 Q14 16 12 12 Z" fill="#f97316" />
            {/* Vòng lôi phù xoay chậm */}
            <circle cx="50" cy="50" r="49" fill="none" stroke="#fde047" strokeWidth="1.5" strokeDasharray="6 3" className="avatar-anim-spin" />
            {/* Ấn ký Huyền Kiếp */}
            <circle cx="50" cy="91" r="9" fill="#450a0a" stroke="#facc15" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fef08a">劫</text>
          </g>
        );

      // Cảnh giới 11: Dương Thực (Thuần dương thái dương, vầng nhật luân chói lọi)
      case "realm-11":
        return (
          <g className="frame-art-realm-11">
            <defs>
              <linearGradient id={`sun_grad_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#f59e0b" />
                <stop offset="80%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#c2410c" />
              </linearGradient>
            </defs>
            {/* Vòng nhật luân thuần dương */}
            <circle cx="50" cy="50" r="43" fill="none" stroke={`url(#sun_grad_${uid})`} strokeWidth="4.2" />
            {/* 12 tia lửa mặt trời (solar corona) */}
            <g className="avatar-anim-spin-slow">
              <polygon points="50,-5 53,5 47,5" fill="#fef08a" />
              <polygon points="75,2 73,11 68,8" fill="#fbbf24" />
              <polygon points="95,18 89,24 86,19" fill="#fef08a" />
              <polygon points="105,50 95,53 95,47" fill="#fbbf24" />
              <polygon points="95,82 86,81 89,76" fill="#fef08a" />
              <polygon points="75,98 68,92 73,89" fill="#fbbf24" />
              <polygon points="50,105 47,95 53,95" fill="#fef08a" />
              <polygon points="25,98 27,89 32,92" fill="#fbbf24" />
              <polygon points="5,82 14,76 11,81" fill="#fef08a" />
              <polygon points="-5,50 5,47 5,53" fill="#fbbf24" />
              <polygon points="5,18 11,19 14,24" fill="#fef08a" />
              <polygon points="25,2 32,8 27,11" fill="#fbbf24" />
            </g>
            {/* Vành bảo hộ thái dương */}
            <circle cx="50" cy="50" r="49" fill="none" stroke="#fed7aa" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Ấn ký Dương Thực */}
            <circle cx="50" cy="91" r="9" fill="#7c2d12" stroke="#fef08a" strokeWidth="2.2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#fffbeb">☀</text>
          </g>
        );

      // Cảnh giới 12: Phi Thăng (Tiên môn rộng mở, đôi cánh thần tiên giang rộng)
      case "realm-12":
        return (
          <g className="frame-art-realm-12">
            <defs>
              <linearGradient id={`ascend_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="35%" stopColor="#38bdf8" />
                <stop offset="70%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#e0e7ff" />
              </linearGradient>
            </defs>
            {/* Vòng tiên môn ngũ sắc */}
            <circle cx="50" cy="50" r="43" fill="none" stroke={`url(#ascend_${uid})`} strokeWidth="4" />
            {/* Cánh tiên cánh thần bên trái */}
            <path d="M7 40 Q-14 25 -8 5 Q4 18 12 25 L3 3 Q16 16 18 32 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Cánh tiên cánh thần bên phải */}
            <path d="M93 40 Q114 25 108 5 Q96 18 88 25 L97 3 Q84 16 82 32 Z" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Mây tiên bồng bềnh ở chân */}
            <path d="M30 96 Q40 88 50 92 Q60 88 70 96 Q50 102 30 96 Z" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="1.2" />
            {/* Vương miện tiên quang trên đỉnh */}
            <polygon points="50,-4 55,6 64,1 58,11 50,8 42,11 36,1 45,6" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            {/* Ấn ký Phi Thăng */}
            <circle cx="50" cy="91" r="9" fill="#0369a1" stroke="#fef08a" strokeWidth="2.2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f0fdf4">升</text>
          </g>
        );

      // Cảnh giới 13: Chân Tiên (Cận Tiên Đế - Đỉnh cao tối thượng tráng lệ)
      case "realm-13":
        return (
          <g className="frame-art-realm-13">
            <defs>
              <linearGradient id={`chan_tien_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#f59e0b" />
                <stop offset="60%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            {/* Vòng hào quang Cửu Trọng Thiên cực kỳ lộng lẫy */}
            <circle cx="50" cy="50" r="43" fill="none" stroke={`url(#chan_tien_${uid})`} strokeWidth="4.5" />
            <circle cx="50" cy="50" r="49" fill="none" stroke="#fde047" strokeWidth="1.8" strokeDasharray="5 2" className="avatar-anim-spin" />
            <circle cx="50" cy="50" r="52" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="10 5" className="avatar-anim-spin-reverse" />
            {/* Vương miện Chân Tiên Hoàng Gia trên đỉnh */}
            <path d="M30 6 L35 -5 L50 -8 L65 -5 L70 6 L60 12 L50 9 L40 12 Z" fill="#fde047" stroke="#b45309" strokeWidth="1.4" />
            <circle cx="50" cy="-3" r="3" fill="#e11d48" stroke="#ffffff" strokeWidth="0.8" />
            {/* Song kiếm tiên hộ thể 2 bên */}
            <polygon points="12,18 9,8 14,11 20,28" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
            <polygon points="88,18 91,8 86,11 80,28" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1" />
            {/* Dải mây ngũ sắc tiên cảnh ở đáy */}
            <path d="M22 93 Q35 84 50 88 Q65 84 78 93 Q65 101 50 98 Q35 101 22 93 Z" fill="#fdf4ff" stroke="#f472b6" strokeWidth="1.2" />
            {/* 12 hạt đại thần châu xoay */}
            <g className="avatar-anim-spin-slow">
              <circle cx="50" cy="0" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
              <circle cx="75" cy="7" r="2.4" fill="#38bdf8" />
              <circle cx="93" cy="25" r="2.8" fill="#f472b6" />
              <circle cx="100" cy="50" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
              <circle cx="93" cy="75" r="2.4" fill="#38bdf8" />
              <circle cx="75" cy="93" r="2.8" fill="#f472b6" />
              <circle cx="50" cy="100" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
              <circle cx="25" cy="93" r="2.4" fill="#38bdf8" />
              <circle cx="7" cy="75" r="2.8" fill="#f472b6" />
              <circle cx="0" cy="50" r="2.8" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.6" />
              <circle cx="7" cy="25" r="2.4" fill="#38bdf8" />
              <circle cx="25" cy="7" r="2.8" fill="#f472b6" />
            </g>
            {/* Ấn ký Chân Tiên */}
            <circle cx="50" cy="91" r="9.5" fill="#831843" stroke="#fef08a" strokeWidth="2.4" />
            <text x="50" y="95" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fffbeb">仙</text>
          </g>
        );

      // =========================================================================
      // NGUYÊN TỐ (ELEMENTS)
      // =========================================================================
      // =========================================================================
      // NGUYÊN TỐ (ELEMENTAL ARTS) - NGŨ HÀNH & DỊ BIẾN PHÂN TẦNG UY THẾ
      // =========================================================================

      // Cấp 1A: Hỏa Linh (Tam Muội Chân Hỏa - 40 XP - Sơ Cấp)
      case "fire":
        return (
          <g className="frame-art-fire">
            <defs>
              <linearGradient id={`grad_fire_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="75%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#991b1b" />
              </linearGradient>
              <linearGradient id={`grad_fire_flame_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#dc2626" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <radialGradient id={`grad_fire_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </radialGradient>
            </defs>

            {/* Vòng Tam Muội Chân Hỏa cuộn sóng */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_fire_ring_${uid})`} strokeWidth="3.6" />

            {/* 8 Đạo Liệt Diễm xoay tròn quanh trục */}
            <g className="avatar-anim-spin">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <path
                  key={deg}
                  d="M50 3 C 53 7, 49 11, 51 13 C 48 10, 46 6, 50 3 Z"
                  fill="#fef08a"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </g>

            {/* Tam Muội Hỏa Diễm đỉnh thiên */}
            <g className="fire-crest">
              <path d="M50 -4 Q56 6 48 8 Q55 1 50 -4 Z" fill={`url(#grad_fire_flame_${uid})`} />
              <path d="M43 4 Q48 10 44 12 Q48 6 43 4 Z" fill="#f97316" />
              <path d="M57 4 Q52 10 56 12 Q52 6 57 4 Z" fill="#f97316" />
            </g>

            {/* Hai dải Liệt Hỏa hộ thể sườn trái & phải */}
            <path d="M8 40 Q-2 48 6 56 Q2 48 8 40 Z" fill="#f97316" />
            <path d="M92 40 Q102 48 94 56 Q98 48 92 40 Z" fill="#f97316" />

            {/* Đốm linh hỏa nhấp nháy */}
            <circle cx="14" cy="22" r="1.8" fill="#fef08a" className="avatar-anim-pulse" />
            <circle cx="86" cy="22" r="1.8" fill="#fef08a" className="avatar-anim-pulse" />

            {/* Tam Muội Hỏa Châu ở đáy */}
            <circle cx="50" cy="91" r="8.5" fill={`url(#grad_fire_orb_${uid})`} stroke="#fef08a" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fef08a">火</text>
          </g>
        );

      // Cấp 1B: Băng Phách (Vạn Niên Huyền Băng - 40 XP - Sơ Cấp)
      case "ice":
        return (
          <g className="frame-art-ice">
            <defs>
              <linearGradient id={`grad_ice_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="40%" stopColor="#7dd3fc" />
                <stop offset="80%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
              <radialGradient id={`grad_ice_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </radialGradient>
            </defs>

            {/* Vòng Huyền Băng Bát Giác Tinh Thể xoay ngược */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_ice_ring_${uid})`} strokeWidth="3.4" />
            <polygon
              points="50,4 83,17 96,50 83,83 50,96 17,83 4,50 17,17"
              fill="none"
              stroke="#bae6fd"
              strokeWidth="1.2"
              strokeDasharray="5 3"
              className="avatar-anim-spin-reverse"
            />

            {/* Băng Phách Thần Tinh 6 hướng sắc nhọn */}
            <polygon points="50,0 53,7 50,13 47,7" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
            <polygon points="99,50 93,53 87,50 93,47" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
            <polygon points="50,99 47,93 50,87 53,93" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
            <polygon points="1,50 7,47 13,50 7,53" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />

            {/* Gai băng 4 góc đối xứng */}
            <polygon points="84,16 77,21 82,24" fill="#7dd3fc" />
            <polygon points="84,84 77,79 82,76" fill="#7dd3fc" />
            <polygon points="16,84 23,79 18,76" fill="#7dd3fc" />
            <polygon points="16,16 23,21 18,24" fill="#7dd3fc" />

            {/* Hạt băng sương nhấp nháy phát quang */}
            <circle cx="30" cy="10" r="1.5" fill="#ffffff" className="avatar-anim-pulse" />
            <circle cx="70" cy="10" r="1.5" fill="#ffffff" className="avatar-anim-pulse" />

            {/* Vạn Niên Băng Châu ở đáy */}
            <circle cx="50" cy="91" r="8.5" fill={`url(#grad_ice_orb_${uid})`} stroke="#bae6fd" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f0f9ff">❄</text>
          </g>
        );

      // Cấp 1C: Thủy Nguyệt (Thủy Nguyệt Kính Hoa - 40 XP - Sơ Cấp)
      case "water":
        return (
          <g className="frame-art-water">
            <defs>
              <linearGradient id={`grad_water_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="40%" stopColor="#38bdf8" />
                <stop offset="80%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0c4a6e" />
              </linearGradient>
              <radialGradient id={`grad_water_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#082f49" />
              </radialGradient>
            </defs>

            {/* Vòng linh thủy xoay nhẹ nhàng */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_water_ring_${uid})`} strokeWidth="3.4" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeDasharray="4 4" className="avatar-anim-spin-slow" />

            {/* Nguyệt Luân Tiên Gia (Vành trăng lưỡi liềm góc trên bên phải) */}
            <path d="M74 8 C 84 14, 86 26, 80 32 C 82 24, 78 14, 74 8 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="82" cy="14" r="1.5" fill="#fefce8" className="avatar-anim-pulse" />

            {/* Sóng nước đa tầng uyển chuyển cuộn ở đáy */}
            <path
              d="M18 84 Q34 76 50 82 Q66 76 82 84 Q66 92 50 88 Q34 92 18 84 Z"
              fill="#0369a1"
              stroke="#7dd3fc"
              strokeWidth="1.2"
            />
            <path
              d="M26 88 Q38 82 50 86 Q62 82 74 88 Q62 94 50 91 Q38 94 26 88 Z"
              fill="#0284c7"
            />

            {/* Giọt linh thủy lơ lửng */}
            <path d="M18 36 C 14 42, 22 42, 18 36 Z" fill="#38bdf8" />
            <path d="M88 56 C 84 62, 92 62, 88 56 Z" fill="#38bdf8" />

            {/* Thủy Nguyệt Bảo Châu ở đáy */}
            <circle cx="50" cy="91" r="8.5" fill={`url(#grad_water_orb_${uid})`} stroke="#7dd3fc" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#f0f9ff">水</text>
          </g>
        );

      // Cấp 2A: Phong Linh (Cửu Tiêu Phong Nhận - 80 XP - Trung Cấp)
      case "wind":
        return (
          <g className="frame-art-wind">
            <defs>
              <linearGradient id={`grad_wind_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="40%" stopColor="#34d399" />
                <stop offset="80%" stopColor="#059669" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <linearGradient id={`grad_wind_blade_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <radialGradient id={`grad_wind_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d1fae5" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#022c22" />
              </radialGradient>
            </defs>

            {/* Vòng lốc xoáy song hành đối nghịch */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_wind_ring_${uid})`} strokeWidth="3.6" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#6ee7b7" strokeWidth="1.2" strokeDasharray="6 4" className="avatar-anim-spin" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#a7f3d0" strokeWidth="0.8" strokeDasharray="3 5" className="avatar-anim-spin-reverse" />

            {/* 4 Lưỡi Phong Đao (Lốc xoáy phiến gió sắc lẹm xé gió) */}
            <g className="avatar-anim-spin">
              <path d="M50 2 C 68 12, 76 26, 68 28 C 60 22, 54 12, 50 2 Z" fill={`url(#grad_wind_blade_${uid})`} stroke="#047857" strokeWidth="0.8" />
              <path d="M98 50 C 88 68, 74 76, 72 68 C 78 60, 88 54, 98 50 Z" fill={`url(#grad_wind_blade_${uid})`} stroke="#047857" strokeWidth="0.8" />
              <path d="M50 98 C 32 88, 24 74, 32 72 C 40 78, 46 88, 50 98 Z" fill={`url(#grad_wind_blade_${uid})`} stroke="#047857" strokeWidth="0.8" />
              <path d="M2 50 C 12 32, 26 24, 28 32 C 22 40, 12 46, 2 50 Z" fill={`url(#grad_wind_blade_${uid})`} stroke="#047857" strokeWidth="0.8" />
            </g>

            {/* Đỉnh Phong Miện lượn sóng */}
            <path d="M42 4 Q50 -2 58 4 Q50 2 42 4 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="0.8" />

            {/* 4 Luồng linh phong uốn lượn xung quanh */}
            <circle cx="18" cy="18" r="1.8" fill="#a7f3d0" className="avatar-anim-pulse" />
            <circle cx="82" cy="18" r="1.8" fill="#a7f3d0" className="avatar-anim-pulse" />
            <circle cx="82" cy="82" r="1.8" fill="#a7f3d0" className="avatar-anim-pulse" />
            <circle cx="18" cy="82" r="1.8" fill="#a7f3d0" className="avatar-anim-pulse" />

            {/* Phong Linh Thần Châu ở đáy */}
            <circle cx="50" cy="91" r="9" fill={`url(#grad_wind_orb_${uid})`} stroke="#a7f3d0" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ecfdf5">彡</text>
          </g>
        );

      // Cấp 2B: Lôi Đình (Cửu Thiên Tử Tiêu Thần Lôi - 80 XP - Trung Cấp)
      case "thunder":
        return (
          <g className="frame-art-thunder">
            <defs>
              <linearGradient id={`grad_thunder_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f5d0fe" />
                <stop offset="35%" stopColor="#c084fc" />
                <stop offset="70%" stopColor="#7e22ce" />
                <stop offset="100%" stopColor="#3b0764" />
              </linearGradient>
              <linearGradient id={`grad_thunder_bolt_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <radialGradient id={`grad_thunder_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#c084fc" />
                <stop offset="80%" stopColor="#581c87" />
                <stop offset="100%" stopColor="#2e1065" />
              </radialGradient>
            </defs>

            {/* Vòng Lôi Ngục Tử Tiêu */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_thunder_ring_${uid})`} strokeWidth="3.6" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#e9d5ff" strokeWidth="1.2" strokeDasharray="4 4" className="avatar-anim-spin" />

            {/* Các tia chớp Lôi Đình thiên kiếp nhấp nháy liên tục */}
            <g className="avatar-anim-flash">
              <path d="M48 2 L53 10 L47 13 L55 22" fill="none" stroke={`url(#grad_thunder_bolt_${uid})`} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M98 47 L90 52 L87 46 L79 55" fill="none" stroke={`url(#grad_thunder_bolt_${uid})`} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M2 53 L10 48 L13 54 L21 45" fill="none" stroke={`url(#grad_thunder_bolt_${uid})`} strokeWidth="2.2" strokeLinecap="round" />
              <path d="M20 18 L25 24 L21 26 L27 33" fill="none" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" />
              <path d="M80 18 L75 24 L79 26 L73 33" fill="none" stroke="#fef08a" strokeWidth="1.6" strokeLinecap="round" />
            </g>

            {/* Bát Quái Lôi Phù ấn ký 8 phương */}
            <circle cx="50" cy="4" r="2.2" fill="#fde047" />
            <circle cx="83" cy="17" r="2.2" fill="#c084fc" />
            <circle cx="96" cy="50" r="2.2" fill="#fde047" />
            <circle cx="83" cy="83" r="2.2" fill="#c084fc" />
            <circle cx="17" cy="83" r="2.2" fill="#c084fc" />
            <circle cx="4" cy="50" r="2.2" fill="#fde047" />
            <circle cx="17" cy="17" r="2.2" fill="#c084fc" />

            {/* Cửu Thiên Lôi Châu ở đáy */}
            <circle cx="50" cy="91" r="9" fill={`url(#grad_thunder_orb_${uid})`} stroke="#fde047" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#faf5ff">ϟ</text>
          </g>
        );

      // Cấp 3A: Ma Ảnh (Cửu U Thôn Thiên Ma Ảnh - 200 XP - Cao Cấp / Dị Biến)
      case "shadow":
        return (
          <g className="frame-art-shadow">
            <defs>
              <linearGradient id={`grad_shadow_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="35%" stopColor="#a855f7" />
                <stop offset="70%" stopColor="#581c87" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              <linearGradient id={`grad_shadow_wing_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#7e22ce" />
                <stop offset="100%" stopColor="#2e1065" />
              </linearGradient>
              <radialGradient id={`grad_shadow_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="45%" stopColor="#9333ea" />
                <stop offset="85%" stopColor="#3b0764" />
                <stop offset="100%" stopColor="#0f0728" />
              </radialGradient>
            </defs>

            {/* Vòng U Minh Ma Giáp dày dặn */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_shadow_ring_${uid})`} strokeWidth="3.8" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="5 4" className="avatar-anim-spin-slow" />

            {/* Cửu U Ma Dực (Đôi cánh ma quỷ giương rộng uy nghi 2 bên) */}
            <g className="shadow-wings">
              {/* Cánh ma trái */}
              <path d="M14 36 C -6 22, -6 6, 8 2 C 12 12, 18 22, 22 32 Z" fill={`url(#grad_shadow_wing_${uid})`} stroke="#c084fc" strokeWidth="0.8" />
              <path d="M8 46 C -8 36, -8 20, 2 12 C 6 22, 12 32, 18 42 Z" fill="#581c87" stroke="#c084fc" strokeWidth="0.8" />
              <path d="M12 56 C -4 52, -4 38, 4 30 C 8 38, 12 46, 16 52 Z" fill="#3b0764" stroke="#c084fc" strokeWidth="0.8" />

              {/* Cánh ma phải */}
              <path d="M86 36 C 106 22, 106 6, 92 2 C 88 12, 82 22, 78 32 Z" fill={`url(#grad_shadow_wing_${uid})`} stroke="#c084fc" strokeWidth="0.8" />
              <path d="M92 46 C 108 36, 108 20, 98 12 C 94 22, 88 32, 82 42 Z" fill="#581c87" stroke="#c084fc" strokeWidth="0.8" />
              <path d="M88 56 C 104 52, 104 38, 96 30 C 92 38, 88 46, 84 52 Z" fill="#3b0764" stroke="#c084fc" strokeWidth="0.8" />
            </g>

            {/* Ma Giác (Cặp sừng ma tôn cong vút trên đỉnh) */}
            <path d="M44 8 C 38 -2, 28 -4, 22 -6 C 30 -2, 38 2, 42 8 Z" fill="#a855f7" stroke="#3b0764" strokeWidth="0.8" />
            <path d="M56 8 C 62 -2, 72 -4, 78 -6 C 70 -2, 62 2, 58 8 Z" fill="#a855f7" stroke="#3b0764" strokeWidth="0.8" />
            <polygon points="50,2 45,9 55,9" fill="#f43f5e" stroke="#3b0764" strokeWidth="0.8" />

            {/* 4 Đốm Ma Hỏa U Minh nhấp nháy phát sáng */}
            <circle cx="10" cy="30" r="2" fill="#f43f5e" className="avatar-anim-pulse" />
            <circle cx="90" cy="30" r="2" fill="#f43f5e" className="avatar-anim-pulse" />
            <circle cx="6" cy="62" r="1.5" fill="#c084fc" />
            <circle cx="94" cy="62" r="1.5" fill="#c084fc" />

            {/* Thôn Thiên Ma Châu ở đáy */}
            <circle cx="50" cy="91" r="9.5" fill={`url(#grad_shadow_orb_${uid})`} stroke="#f472b6" strokeWidth="2.2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#fff1f2">魔</text>
          </g>
        );

      // Cấp 3B: Tiên Quang (Thái Cổ Thái Dương Tiên Quang - 200 XP - Cao Cấp / Thánh Quang)
      case "light":
        return (
          <g className="frame-art-light">
            <defs>
              <linearGradient id={`grad_light_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <radialGradient id={`grad_light_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#fef08a" />
                <stop offset="75%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
            </defs>

            {/* Vòng Kim Luân Thái Cổ Tiên Quang */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_light_ring_${uid})`} strokeWidth="3.8" />

            {/* 16 Đạo Thái Dương Thánh Quang xoay thuận chiều */}
            <g className="avatar-anim-spin">
              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
                <polygon
                  key={deg}
                  points="50,-2 51.5,4 48.5,4"
                  fill="#fef08a"
                  stroke="#b45309"
                  strokeWidth="0.5"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </g>

            {/* Vòng phù chú Tiên Thiên xoay ngược */}
            <circle cx="50" cy="50" r="47" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="5 3" className="avatar-anim-spin-reverse" />

            {/* Cặp Tiên Dực Thánh Khiết giương cánh hai bên */}
            <g className="light-wings">
              {/* Cánh trái */}
              <path d="M14 36 C -6 22, -6 6, 8 2 C 12 12, 18 22, 22 32 Z" fill="#ffffff" stroke="#f59e0b" strokeWidth="0.8" />
              <path d="M8 46 C -8 36, -8 20, 2 12 C 6 22, 12 32, 18 42 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
              <path d="M12 56 C -4 52, -4 38, 4 30 C 8 38, 12 46, 16 52 Z" fill="#fde047" stroke="#d97706" strokeWidth="0.8" />

              {/* Cánh phải */}
              <path d="M86 36 C 106 22, 106 6, 92 2 C 88 12, 82 22, 78 32 Z" fill="#ffffff" stroke="#f59e0b" strokeWidth="0.8" />
              <path d="M92 46 C 110 36, 110 20, 98 12 C 94 22, 88 32, 82 42 Z" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
              <path d="M88 56 C 104 52, 104 38, 96 30 C 92 38, 88 46, 84 52 Z" fill="#fde047" stroke="#d97706" strokeWidth="0.8" />
            </g>

            {/* Tiên Miện Thánh Quang Bát Hướng ở đỉnh */}
            <g className="light-crown">
              <polygon points="50,-6 53,4 50,11 47,4" fill="#ffffff" stroke="#f59e0b" strokeWidth="1" />
              <circle cx="50" cy="-4" r="2.2" fill="#fde047" stroke="#b45309" strokeWidth="0.8" className="avatar-anim-pulse" />
            </g>

            {/* 8 Tinh Tú Thánh Quang nhấp nháy phát sáng */}
            <g className="avatar-anim-flash">
              <circle cx="50" cy="4" r="1.8" fill="#ffffff" />
              <circle cx="83" cy="17" r="1.8" fill="#fef08a" />
              <circle cx="96" cy="50" r="1.8" fill="#ffffff" />
              <circle cx="83" cy="83" r="1.8" fill="#fef08a" />
              <circle cx="17" cy="83" r="1.8" fill="#fef08a" />
              <circle cx="4" cy="50" r="1.8" fill="#ffffff" />
              <circle cx="17" cy="17" r="1.8" fill="#fef08a" />
            </g>

            {/* Vạn Tượng Tiên Châu ở đáy */}
            <circle cx="50" cy="91" r="9.5" fill={`url(#grad_light_orb_${uid})`} stroke="#ffffff" strokeWidth="2.4" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#78350f">✦</text>
          </g>
        );

      // =========================================================================
      // LINH THÚ (BEASTS)
      // =========================================================================
      // LINH THÚ (MYTHICAL BEASTS) - THẦN THÚ HỘ THỂ PHÂN TẦNG UY THẾ
      // =========================================================================

      // Cấp 1: Hồ Ly (Cửu Vĩ Thiên Hồ - Mị Ảnh Linh Hoa - 80 XP)
      case "fox":
        return (
          <g className="frame-art-fox">
            <defs>
              <linearGradient id={`grad_fox_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="50%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
              <linearGradient id={`grad_fox_tail_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fdf2f8" />
                <stop offset="40%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#9d174d" />
              </linearGradient>
              <radialGradient id={`grad_fox_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbcfe8" />
                <stop offset="60%" stopColor="#db2777" />
                <stop offset="100%" stopColor="#700733" />
              </radialGradient>
            </defs>

            {/* Vòng linh quang hồ ly mị hoặc */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_fox_ring_${uid})`} strokeWidth="3" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="#fbcfe8" strokeWidth="1" strokeDasharray="4 4" className="avatar-anim-spin-slow" />

            {/* Cửu Vĩ (9 chiếc đuôi hồ tiên uốn lượn thướt tha ôm quanh nửa dưới) */}
            <g className="fox-tails" opacity="0.95">
              <path d="M22 75 C 6 74, -2 60, 2 46 C 5 40, 9 44, 12 54 C 15 64, 20 72, 22 75 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M26 82 C 10 84, 2 72, 5 58 C 8 52, 12 56, 16 66 C 20 74, 24 80, 26 82 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M32 88 C 16 93, 8 83, 11 70 C 13 65, 17 68, 20 77 C 24 84, 30 87, 32 88 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M40 93 C 24 102, 16 93, 20 82 C 22 78, 26 82, 28 88 C 32 93, 38 93, 40 93 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M46 95 C 43 105, 57 105, 54 95 C 52 91, 48 91, 46 95 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M60 93 C 76 102, 84 93, 80 82 C 78 78, 74 82, 72 88 C 68 93, 62 93, 60 93 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M68 88 C 84 93, 92 83, 89 70 C 87 65, 83 68, 80 77 C 76 84, 70 87, 68 88 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M74 82 C 90 84, 98 72, 95 58 C 92 52, 88 56, 84 66 C 80 74, 76 80, 74 82 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
              <path d="M78 75 C 94 74, 102 60, 98 46 C 95 40, 91 44, 88 54 C 85 64, 80 72, 78 75 Z" fill={`url(#grad_fox_tail_${uid})`} stroke="#f472b6" strokeWidth="0.8" />
            </g>

            {/* Linh Nhĩ (Đôi tai hồ ly tinh xảo trên đỉnh) */}
            <g className="fox-ears">
              <path d="M30 14 C 23 4, 15 -2, 10 -4 C 17 -1, 26 2, 34 11 Z" fill="#fda4af" stroke="#db2777" strokeWidth="1.2" />
              <path d="M27 12 C 22 5, 17 0, 13 -1 C 18 1, 24 3, 30 10 Z" fill="#831843" />
              <path d="M70 14 C 77 4, 85 -2, 90 -4 C 83 -1, 74 2, 66 11 Z" fill="#fda4af" stroke="#db2777" strokeWidth="1.2" />
              <path d="M73 12 C 78 5, 83 0, 87 -1 C 82 1, 76 3, 70 10 Z" fill="#831843" />
              {/* Linh hoa mai ấn ký trán */}
              <circle cx="50" cy="8" r="4.5" fill="#fdf2f8" stroke="#db2777" strokeWidth="1.2" />
              <polygon points="50,4 51.5,7 54.5,8 51.5,9 50,12 48.5,9 45.5,8 48.5,7" fill="#f43f5e" />
            </g>

            {/* Đốm lửa Hồ Hỏa mị hoặc bay lượn */}
            <circle cx="10" cy="36" r="2.2" fill="#f472b6" className="avatar-anim-pulse" />
            <circle cx="90" cy="36" r="2.2" fill="#f472b6" className="avatar-anim-pulse" />
            <circle cx="4" cy="54" r="1.6" fill="#fbcfe8" />
            <circle cx="96" cy="54" r="1.6" fill="#fbcfe8" />

            {/* Cửu Vĩ Linh Hồ Châu ở đáy */}
            <circle cx="50" cy="91" r="9" fill={`url(#grad_fox_orb_${uid})`} stroke="#fbcfe8" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff1f2">狐</text>
          </g>
        );

      // Cấp 2A: Huyền Vũ (Bắc Minh Chân Võ Thần Quy - Quy Xà Hợp Thể - 200 XP)
      case "turtle":
        return (
          <g className="frame-art-turtle">
            <defs>
              <linearGradient id={`grad_turtle_shell_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="50%" stopColor="#0d9488" />
                <stop offset="100%" stopColor="#042f2e" />
              </linearGradient>
              <linearGradient id={`grad_turtle_snake_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#064e3b" />
              </linearGradient>
              <radialGradient id={`grad_turtle_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#99f6e4" />
                <stop offset="60%" stopColor="#0f766e" />
                <stop offset="100%" stopColor="#042f2e" />
              </radialGradient>
            </defs>

            {/* Vòng giáp mai rùa Bát Giác Huyền Vũ */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_turtle_shell_${uid})`} strokeWidth="3.6" />
            <polygon
              points="50,4 83,17 96,50 83,83 50,96 17,83 4,50 17,17"
              fill="none"
              stroke="#5eead4"
              strokeWidth="1.4"
              strokeDasharray="6 3"
              className="avatar-anim-spin-slow"
            />

            {/* 8 Phù văn hộ giáp phương vị trên mai rùa */}
            <circle cx="50" cy="5" r="2" fill="#5eead4" />
            <circle cx="82" cy="18" r="2" fill="#5eead4" />
            <circle cx="95" cy="50" r="2" fill="#5eead4" />
            <circle cx="82" cy="82" r="2" fill="#5eead4" />
            <circle cx="50" cy="95" r="2" fill="#5eead4" />
            <circle cx="18" cy="82" r="2" fill="#5eead4" />
            <circle cx="5" cy="50" r="2" fill="#5eead4" />
            <circle cx="18" cy="18" r="2" fill="#5eead4" />

            {/* Thần Xà uốn lượn quấn quanh mai rùa (Quy Xà Hợp Thể) */}
            <path
              d="M12 70 C 0 54, 4 28, 22 14 C 36 4, 62 4, 76 12 C 88 18, 96 34, 94 56 C 92 70, 84 82, 70 88"
              fill="none"
              stroke={`url(#grad_turtle_snake_${uid})`}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Vảy rắn thần */}
            <path
              d="M12 70 C 0 54, 4 28, 22 14 C 36 4, 62 4, 76 12 C 88 18, 96 34, 94 56 C 92 70, 84 82, 70 88"
              fill="none"
              stroke="#99f6e4"
              strokeWidth="1.4"
              strokeDasharray="2 3"
              strokeLinecap="round"
            />
            {/* Đầu Thần Xà ngẩng cao góc trên bên phải */}
            <path d="M74 13 Q80 8 86 10 Q88 15 82 17 Z" fill="#2dd4bf" stroke="#042f2e" strokeWidth="1" />
            <circle cx="82" cy="12" r="1.3" fill="#f43f5e" />
            <path d="M86 10 L90 8 M86 10 L89 12" stroke="#f43f5e" strokeWidth="0.8" />

            {/* Đầu Thần Quy ở góc trên bên trái */}
            <path d="M22 14 Q14 10 16 4 Q24 5 25 11 Z" fill="#0d9488" stroke="#5eead4" strokeWidth="1" />
            <circle cx="19" cy="8" r="1.2" fill="#fef08a" />

            {/* 4 Chân Móng Quy Giáp Bắc Minh */}
            <path d="M6 38 L-1 42 L5 46 Z" fill="#14b8a6" stroke="#042f2e" strokeWidth="0.8" />
            <path d="M6 62 L-1 58 L5 54 Z" fill="#14b8a6" stroke="#042f2e" strokeWidth="0.8" />
            <path d="M94 38 L101 42 L95 46 Z" fill="#14b8a6" stroke="#042f2e" strokeWidth="0.8" />
            <path d="M94 62 L101 58 L95 54 Z" fill="#14b8a6" stroke="#042f2e" strokeWidth="0.8" />

            {/* Sóng nước Bắc Minh cuộn trào dưới đáy đỡ Thần Châu */}
            <path d="M34 88 Q42 94 50 88 Q58 94 66 88" fill="none" stroke="#2dd4bf" strokeWidth="1.8" />

            {/* Bắc Đẩu Thất Tinh Thần Châu ở đáy */}
            <circle cx="50" cy="91" r="9" fill={`url(#grad_turtle_orb_${uid})`} stroke="#5eead4" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f0fdfa">玄</text>
          </g>
        );

      // Cấp 2B: Bạch Hổ (Tây Phương Canh Kim Thần Hổ - Sát Phạt Chúa Tể - 200 XP)
      case "tiger":
        return (
          <g className="frame-art-tiger">
            <defs>
              <linearGradient id={`grad_tiger_ring_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="40%" stopColor="#cbd5e1" />
                <stop offset="80%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <radialGradient id={`grad_tiger_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="60%" stopColor="#334155" />
                <stop offset="100%" stopColor="#0f172a" />
              </radialGradient>
            </defs>

            {/* Vòng Canh Kim Sát Phạt Răng Cưa Bạch Kim */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_tiger_ring_${uid})`} strokeWidth="3.4" />
            <g className="avatar-anim-spin-reverse">
              {/* 8 Lưỡi Canh Kim hình kiếm cưa xoay quanh viền */}
              <polygon points="50,2 47,7 53,7" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <polygon points="84,16 80,20 85,24" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <polygon points="98,50 93,47 93,53" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <polygon points="84,84 85,79 80,83" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <polygon points="50,98 53,93 47,93" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <polygon points="16,84 20,80 15,76" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <polygon points="2,50 7,53 7,47" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
              <polygon points="16,16 15,21 20,17" fill="#f8fafc" stroke="#64748b" strokeWidth="0.8" />
            </g>

            {/* Tai Thần Hổ và bờm hổ ở đỉnh */}
            <g className="tiger-head">
              <polygon points="28,14 18,2 34,7" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
              <polygon points="26,12 20,4 30,7" fill="#334155" />
              <polygon points="72,14 82,2 66,7" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
              <polygon points="74,12 80,4 70,7" fill="#334155" />

              {/* Hổ Ngạch Hoàng Kim - Chữ VƯƠNG (王) thần thánh uy nghi */}
              <rect x="42" y="3" width="16" height="10" rx="2" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.4" />
              <line x1="45" y1="5.5" x2="55" y2="5.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="46.5" y1="8" x2="53.5" y2="8" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="44" y1="10.5" x2="56" y2="10.5" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
              <line x1="50" y1="5.5" x2="50" y2="10.5" stroke="#fef08a" strokeWidth="1.2" />
            </g>

            {/* Canh Kim Trảo Khí (3 vết móng vuốt cào rách hư không hai bên) */}
            <g className="tiger-claws">
              <path d="M8 38 L-4 44 L4 47 Z" fill="#f8fafc" stroke="#f59e0b" strokeWidth="0.8" />
              <path d="M6 47 L-6 50 L2 53 Z" fill="#f8fafc" stroke="#f59e0b" strokeWidth="0.8" />
              <path d="M8 56 L-4 56 L4 59 Z" fill="#f8fafc" stroke="#f59e0b" strokeWidth="0.8" />
              <path d="M92 38 L104 44 L96 47 Z" fill="#f8fafc" stroke="#f59e0b" strokeWidth="0.8" />
              <path d="M94 47 L106 50 L98 53 Z" fill="#f8fafc" stroke="#f59e0b" strokeWidth="0.8" />
              <path d="M92 56 L104 56 L96 59 Z" fill="#f8fafc" stroke="#f59e0b" strokeWidth="0.8" />
            </g>

            {/* Tia chớp Canh Kim sát phạt nhấp nháy */}
            <polyline points="14,24 10,29 16,31 12,37" fill="none" stroke="#fef08a" strokeWidth="1" className="avatar-anim-flash" />
            <polyline points="86,24 90,29 84,31 88,37" fill="none" stroke="#fef08a" strokeWidth="1" className="avatar-anim-flash" />

            {/* Bạch Hổ Sát Hồn Châu ở đáy */}
            <circle cx="50" cy="91" r="9" fill={`url(#grad_tiger_orb_${uid})`} stroke="#f8fafc" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f8fafc">虎</text>
          </g>
        );

      // Cấp 3A: Chu Tước (Nam Phương Bất Diệt Phượng Hoàng - Niết Bàn Chân Hỏa - 380 XP)
      case "phoenix":
        return (
          <g className="frame-art-phoenix">
            <defs>
              <linearGradient id={`grad_phoenix_wing_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="35%" stopColor="#f97316" />
                <stop offset="70%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#7c2d12" />
              </linearGradient>
              <linearGradient id={`grad_phoenix_flame_${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="60%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <radialGradient id={`grad_phoenix_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </radialGradient>
            </defs>

            {/* Vòng lửa Niết Bàn Chân Hỏa xoay tròn */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_phoenix_flame_${uid})`} strokeWidth="3.6" />
            <g className="avatar-anim-spin">
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <path
                  key={deg}
                  d="M50 3 C 52 7, 49 10, 50 12 C 48 9, 47 6, 50 3 Z"
                  fill="#fef08a"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </g>

            {/* Chu Tước Chi Dực (Đôi cánh thần điểu giương rộng 3 tầng lông vũ rực lửa) */}
            <g className="phoenix-wings">
              <path d="M12 45 C -8 30, -6 6, 8 -2 C 10 12, 16 26, 22 38 Z" fill={`url(#grad_phoenix_wing_${uid})`} stroke="#ea580c" strokeWidth="0.8" />
              <path d="M8 56 C -10 44, -10 24, 2 14 C 6 26, 12 40, 18 50 Z" fill={`url(#grad_phoenix_wing_${uid})`} stroke="#ea580c" strokeWidth="0.8" />
              <path d="M14 66 C -4 60, -4 44, 6 34 C 10 44, 15 54, 18 62 Z" fill={`url(#grad_phoenix_wing_${uid})`} stroke="#ea580c" strokeWidth="0.8" />

              <path d="M88 45 C 108 30, 106 6, 92 -2 C 90 12, 84 26, 78 38 Z" fill={`url(#grad_phoenix_wing_${uid})`} stroke="#ea580c" strokeWidth="0.8" />
              <path d="M92 56 C 110 44, 110 24, 98 14 C 94 26, 88 40, 82 50 Z" fill={`url(#grad_phoenix_wing_${uid})`} stroke="#ea580c" strokeWidth="0.8" />
              <path d="M86 66 C 104 60, 104 44, 94 34 C 90 44, 85 54, 82 62 Z" fill={`url(#grad_phoenix_wing_${uid})`} stroke="#ea580c" strokeWidth="0.8" />
            </g>

            {/* Phượng Quán (Mào phượng hoàng kiêu hãnh trên đỉnh) */}
            <g className="phoenix-crown">
              <path d="M50 8 C 48 0, 46 -6, 50 -8 C 54 -6, 52 0, 50 8 Z" fill="#fef08a" stroke="#dc2626" strokeWidth="0.8" />
              <circle cx="50" cy="-8" r="2.2" fill="#ef4444" stroke="#fef08a" strokeWidth="0.8" className="avatar-anim-pulse" />
              <path d="M47 8 C 42 2, 38 -2, 40 -4 C 44 -2, 46 2, 48 8 Z" fill="#fbbf24" stroke="#dc2626" strokeWidth="0.6" />
              <circle cx="40" cy="-4" r="1.4" fill="#f97316" />
              <path d="M53 8 C 58 2, 62 -2, 60 -4 C 56 -2, 54 2, 52 8 Z" fill="#fbbf24" stroke="#dc2626" strokeWidth="0.6" />
              <circle cx="60" cy="-4" r="1.4" fill="#f97316" />
            </g>

            {/* Phượng Vĩ (3 Dải lông đuôi mềm mại thướt tha rủ xuống đáy) */}
            <g className="phoenix-tail">
              <path d="M30 84 C 16 94, 18 106, 28 108 C 34 106, 30 96, 36 86 Z" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="28" cy="107" r="3" fill="#ef4444" stroke="#fef08a" strokeWidth="1" />
              <circle cx="28" cy="107" r="1.2" fill="#059669" />

              <path d="M70 84 C 84 94, 82 106, 72 108 C 66 106, 70 96, 64 86 Z" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="72" cy="107" r="3" fill="#ef4444" stroke="#fef08a" strokeWidth="1" />
              <circle cx="72" cy="107" r="1.2" fill="#059669" />

              <path d="M50 86 L50 102" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" />
            </g>

            {/* Chu Tước Hỏa Châu ở đáy */}
            <circle cx="50" cy="91" r="9.5" fill={`url(#grad_phoenix_orb_${uid})`} stroke="#fef08a" strokeWidth="2.2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#fff7ed">雀</text>
          </g>
        );

      // Cấp 3B: Thanh Long (Đông Phương Bàn Long - Ất Mộc Thần Long - 380 XP)
      case "dragon":
        return (
          <g className="frame-art-dragon">
            <defs>
              <linearGradient id={`grad_dragon_body_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="40%" stopColor="#10b981" />
                <stop offset="80%" stopColor="#047857" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>
              <linearGradient id={`grad_dragon_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id={`grad_dragon_pearl_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="40%" stopColor="#34d399" />
                <stop offset="80%" stopColor="#065f46" />
                <stop offset="100%" stopColor="#022c22" />
              </radialGradient>
            </defs>

            {/* Vòng lôi vân hộ thể rồng */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_dragon_body_${uid})`} strokeWidth="3.8" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="6 4" className="avatar-anim-spin-slow" />

            {/* Thân Bàn Long uốn lượn hùng vĩ quanh viền */}
            <path
              d="M16 82 C 2 64, 4 36, 18 18 C 32 6, 68 6, 82 18 C 96 36, 98 64, 84 82"
              fill="none"
              stroke="#047857"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Vảy rồng lấp lánh */}
            <path
              d="M16 82 C 2 64, 4 36, 18 18 C 32 6, 68 6, 82 18 C 96 36, 98 64, 84 82"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="2"
              strokeDasharray="2 3"
              strokeLinecap="round"
            />

            {/* Long Trảo (Móng vuốt ngũ trảo thần long bám 2 bên viền) */}
            <g className="dragon-claws">
              <path d="M6 42 L-2 38 L4 46 L-3 50 L5 52 L-1 56 L8 54 Z" fill="#6ee7b7" stroke="#064e3b" strokeWidth="0.8" />
              <circle cx="4" cy="46" r="1.5" fill="#fef08a" />
              <path d="M94 42 L102 38 L96 46 L103 50 L95 52 L101 56 L92 54 Z" fill="#6ee7b7" stroke="#064e3b" strokeWidth="0.8" />
              <circle cx="96" cy="46" r="1.5" fill="#fef08a" />
            </g>

            {/* Thần Long Chi Thủ (Đầu Rồng oai nghiêm đỉnh thiên) */}
            <g className="dragon-head">
              {/* Bờm rồng (Long tông) xanh ngọc phiêu dật */}
              <path d="M38 12 C 30 4, 22 2, 16 4 C 24 8, 30 14, 36 16 Z" fill="#a7f3d0" stroke="#047857" strokeWidth="0.8" />
              <path d="M62 12 C 70 4, 78 2, 84 4 C 76 8, 70 14, 64 16 Z" fill="#a7f3d0" stroke="#047857" strokeWidth="0.8" />

              {/* Long Giác (Đôi sừng rồng hoàng kim phân nhánh hùng vĩ) */}
              <path d="M42 10 C 38 2, 32 -3, 26 -5 C 32 -2, 36 2, 40 8 Z" fill={`url(#grad_dragon_gold_${uid})`} stroke="#78350f" strokeWidth="0.8" />
              <path d="M33 -1 C 28 -4, 24 -6, 20 -7 C 24 -4, 28 -2, 31 1 Z" fill={`url(#grad_dragon_gold_${uid})`} stroke="#78350f" strokeWidth="0.6" />

              <path d="M58 10 C 62 2, 68 -3, 74 -5 C 68 -2, 64 2, 60 8 Z" fill={`url(#grad_dragon_gold_${uid})`} stroke="#78350f" strokeWidth="0.8" />
              <path d="M67 -1 C 72 -4, 76 -6, 80 -7 C 76 -4, 72 -2, 69 1 Z" fill={`url(#grad_dragon_gold_${uid})`} stroke="#78350f" strokeWidth="0.6" />

              {/* Long Diện & Long Tu */}
              <polygon points="50,2 45,10 55,10" fill="#10b981" stroke="#064e3b" strokeWidth="1" />
              <circle cx="50" cy="5" r="2.2" fill="#fef08a" stroke="#b45309" strokeWidth="0.8" className="avatar-anim-pulse" />
              <path d="M44 11 C 36 14, 28 20, 24 28" fill="none" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M56 11 C 64 14, 72 20, 76 28" fill="none" stroke="#fef08a" strokeWidth="1.2" strokeLinecap="round" />
            </g>

            {/* Tường Vân ngọc bích bay bồng bềnh */}
            <path d="M22 84 Q16 80 18 74 Q24 74 26 78 Z" fill="#a7f3d0" opacity="0.8" />
            <path d="M78 84 Q84 80 82 74 Q76 74 74 78 Z" fill="#a7f3d0" opacity="0.8" />

            {/* Thái Ất Thanh Long Châu ở đáy */}
            <circle cx="50" cy="91" r="9.5" fill={`url(#grad_dragon_pearl_${uid})`} stroke="#fef08a" strokeWidth="2.2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#ecfdf5">龍</text>
          </g>
        );

      // Cấp 4: Kỳ Lân (Hỗn Nguyên Thần Thú Hoàng Cực Thánh Đức - Đỉnh Cao Linh Thú - 640 XP)
      case "qilin":
        return (
          <g className="frame-art-qilin">
            <defs>
              <linearGradient id={`grad_qilin_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="30%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </linearGradient>
              <linearGradient id={`grad_qilin_rainbow_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="33%" stopColor="#38bdf8" />
                <stop offset="66%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
              <radialGradient id={`grad_qilin_orb_${uid}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#fef08a" />
                <stop offset="75%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#78350f" />
              </radialGradient>
            </defs>

            {/* Vòng Kim Luân Thánh Đức Hoàng Cực */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#grad_qilin_gold_${uid})`} strokeWidth="4.2" />

            {/* Vòng Thái Dương Thánh Quang xoay vần */}
            <g className="avatar-anim-spin">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <polygon
                  key={deg}
                  points="50,-1 52,5 48,5"
                  fill="#fde047"
                  stroke="#b45309"
                  strokeWidth="0.6"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
            </g>

            {/* Vòng Ngũ Sắc Tường Vân xoay ngược chiều */}
            <circle
              cx="50"
              cy="50"
              r="47.5"
              fill="none"
              stroke={`url(#grad_qilin_rainbow_${uid})`}
              strokeWidth="1.5"
              strokeDasharray="7 5"
              className="avatar-anim-spin-reverse"
            />

            {/* Cánh Tiên Dực Kỳ Lân và Bờm Thánh Thú hai bên */}
            <g className="qilin-wings">
              <path d="M12 40 C -8 24, -6 6, 8 2 C 12 14, 18 26, 22 36 Z" fill={`url(#grad_qilin_gold_${uid})`} stroke="#b45309" strokeWidth="1" />
              <path d="M8 52 C -10 40, -8 24, 4 18 C 8 28, 14 40, 18 48 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              <path d="M6 64 Q-4 60 0 54 Q8 52 14 58 Z" fill="#ec4899" opacity="0.85" />
              <path d="M12 74 Q4 70 8 64 Q16 64 20 70 Z" fill="#38bdf8" opacity="0.85" />

              <path d="M88 40 C 108 24, 106 6, 92 2 C 88 14, 82 26, 78 36 Z" fill={`url(#grad_qilin_gold_${uid})`} stroke="#b45309" strokeWidth="1" />
              <path d="M92 52 C 110 40, 108 24, 96 18 C 92 28, 86 40, 82 48 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
              <path d="M94 64 Q104 60 100 54 Q92 52 86 58 Z" fill="#ec4899" opacity="0.85" />
              <path d="M88 74 Q96 70 92 64 Q84 64 80 70 Z" fill="#38bdf8" opacity="0.85" />
            </g>

            {/* Kỳ Lân Thánh Thủ & Độc Giác Hoàng Kim ở đỉnh */}
            <g className="qilin-head">
              <path d="M36 10 C 26 2, 22 -4, 18 -6 C 26 -2, 32 4, 38 8 Z" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />
              <path d="M64 10 C 74 2, 78 -4, 82 -6 C 74 -2, 68 4, 62 8 Z" fill="#fde047" stroke="#b45309" strokeWidth="0.8" />

              <polygon points="50,-8 54,6 46,6" fill={`url(#grad_qilin_gold_${uid})`} stroke="#78350f" strokeWidth="1.2" />
              <circle cx="50" cy="-7" r="2.8" fill="#ef4444" stroke="#fef08a" strokeWidth="1" className="avatar-anim-pulse" />

              <polygon points="34,12 24,2 38,6" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
              <polygon points="66,12 76,2 62,6" fill="#fef08a" stroke="#b45309" strokeWidth="1" />

              <polygon points="50,4 44,11 56,11" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
              <circle cx="50" cy="8" r="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.8" />
            </g>

            {/* 8 Viên Thụy Thú Linh Châu đính xung quanh bảo vệ */}
            <circle cx="50" cy="5" r="2.2" fill="#ef4444" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="82" cy="18" r="2.2" fill="#38bdf8" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="95" cy="50" r="2.2" fill="#10b981" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="82" cy="82" r="2.2" fill="#ec4899" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="50" cy="95" r="2.2" fill="#f59e0b" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="18" cy="82" r="2.2" fill="#38bdf8" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="5" cy="50" r="2.2" fill="#10b981" stroke="#fef08a" strokeWidth="0.8" />
            <circle cx="18" cy="18" r="2.2" fill="#ec4899" stroke="#fef08a" strokeWidth="0.8" />

            {/* Kỳ Lân Thánh Tọa Sen Vàng & Hoàng Cực Thần Châu ở đáy */}
            <path d="M34 88 C 40 95, 60 95, 66 88 C 62 85, 38 85, 34 88 Z" fill="#b45309" stroke="#fde047" strokeWidth="1" />
            <circle cx="50" cy="91" r="10.5" fill={`url(#grad_qilin_orb_${uid})`} stroke="#fde047" strokeWidth="2.5" />
            <text x="50" y="95" textAnchor="middle" fontSize="10.5" fontWeight="bold" fill="#78350f">麟</text>
          </g>
        );

      // =========================================================================
      // ĐẠO HẠNH (ACHIEVEMENTS) - VẠN CỔ TU ĐẠO TIÊN GIA
      // =========================================================================

      // Cấp 1: Nhập môn (Thanh Mộc Tiên Đằng - Sơ Ngộ Tiên Duyên - 10 Đạo hạnh)
      case "beginner":
        return (
          <g className="frame-art-beginner">
            <defs>
              <linearGradient id={`spirit_wood_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
            </defs>
            {/* Vòng ngọc bích linh mộc */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#spirit_wood_${uid})`} strokeWidth="3" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="#6ee7b7" strokeWidth="1" strokeDasharray="5 4" className="avatar-anim-spin" />

            {/* DÂY LEO TIÊN MỘC (Thanh Mộc Tiên Đằng) quấn quanh hai bên viền */}
            {/* Cụm lá ngọc bên trái */}
            <path d="M14 28 Q4 32 10 42 Q18 36 14 28 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="0.8" />
            <path d="M6 48 Q-4 54 4 64 Q12 56 6 48 Z" fill="#34d399" stroke="#047857" strokeWidth="0.8" />
            <path d="M12 70 Q4 78 14 86 Q20 76 12 70 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="0.8" />

            {/* Cụm lá ngọc bên phải */}
            <path d="M86 28 Q96 32 90 42 Q82 36 86 28 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="0.8" />
            <path d="M94 48 Q104 54 96 64 Q88 56 94 48 Z" fill="#34d399" stroke="#047857" strokeWidth="0.8" />
            <path d="M88 70 Q96 78 86 86 Q80 76 88 70 Z" fill="#6ee7b7" stroke="#059669" strokeWidth="0.8" />

            {/* Búp hoa tiên thảo nở ở đỉnh đầu */}
            <path d="M50 -4 Q55 4 50 8 Q45 4 50 -4 Z" fill="#ecfdf5" stroke="#10b981" strokeWidth="1" />
            <path d="M43 0 Q48 5 46 9 Q40 4 43 0 Z" fill="#a7f3d0" />
            <path d="M57 0 Q52 5 54 9 Q60 4 57 0 Z" fill="#a7f3d0" />

            {/* Hạt linh sương phát sáng */}
            <circle cx="10" cy="42" r="1.8" fill="#ecfdf5" />
            <circle cx="90" cy="42" r="1.8" fill="#ecfdf5" />
            <circle cx="50" cy="-4" r="2" fill="#fef08a" />

            {/* Huy hiệu Nhập Môn */}
            <circle cx="50" cy="91" r="8" fill="#064e3b" stroke="#a7f3d0" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ecfdf5">Ⅰ</text>
          </g>
        );

      // Cấp 2: Đồng hành (Lam Tinh Hạc Vũ - Bạch Ngân Tiên Cánh - 200 Đạo hạnh)
      case "companion":
        return (
          <g className="frame-art-companion">
            <defs>
              <linearGradient id={`crane_feather_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Vòng hào quang lam tinh thạch */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#38bdf8" strokeWidth="3.2" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#7dd3fc" strokeWidth="1" strokeDasharray="6 3" className="avatar-anim-spin" />

            {/* ĐÔI CÁNH HẠC TIÊN BẠCH NGÂN (Silver Crane Wings) hai bên */}
            {/* Cánh hạc trái giang rộng */}
            <path d="M12 65 Q-8 50 -4 28 Q4 40 14 46 L0 18 Q14 30 18 42 Z" fill={`url(#crane_feather_${uid})`} stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M4 35 Q-12 25 -6 10 Q6 22 10 32 Z" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="1" />

            {/* Cánh hạc phải giang rộng */}
            <path d="M88 65 Q108 50 104 28 Q96 40 86 46 L100 18 Q86 30 82 42 Z" fill={`url(#crane_feather_${uid})`} stroke="#38bdf8" strokeWidth="1.2" />
            <path d="M96 35 Q112 25 106 10 Q94 22 90 32 Z" fill="#f0f9ff" stroke="#7dd3fc" strokeWidth="1" />

            {/* Lông vũ tiên hạc đan chéo trên đỉnh */}
            <path d="M42 4 Q50 -2 58 4 Q50 6 42 4 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
            <polygon points="50,-4 52,2 50,6 48,2" fill="#fef08a" />

            {/* Dải mây lam nhạt ở chân */}
            <path d="M30 95 Q40 89 50 92 Q60 89 70 95 Q50 100 30 95 Z" fill="#f0f9ff" stroke="#bae6fd" strokeWidth="1" />

            {/* Huy hiệu Đồng Hành */}
            <circle cx="50" cy="91" r="8.5" fill="#075985" stroke="#bae6fd" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f0f9ff">Ⅱ</text>
          </g>
        );

      // Cấp 3: Đạo hữu bền bỉ (Tử Kim Tiên Miện - Thiên Niên Đạo Tâm - 980 Đạo hạnh)
      case "devoted":
        return (
          <g className="frame-art-devoted">
            <defs>
              <linearGradient id={`gold_crown_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#a16207" />
              </linearGradient>
              <linearGradient id={`purple_sash_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#581c87" />
              </linearGradient>
            </defs>
            {/* Vòng hào quang tử kim hoàng gia */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#a855f7" strokeWidth="3.4" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#fde047" strokeWidth="1.4" strokeDasharray="5 3" className="avatar-anim-spin" />

            {/* VƯƠNG MIỆN TỬ KIM HOÀNG GIA (Amethyst Golden Crown) trên đỉnh đầu */}
            <path d="M26 8 L32 -3 L42 5 L50 -8 L58 5 L68 -3 L74 8 L64 12 L50 9 L36 12 Z" fill={`url(#gold_crown_${uid})`} stroke="#78350f" strokeWidth="1.2" />
            {/* Đại ngọc tử tinh hình thoi ở giữa vương miện */}
            <polygon points="50,-5 54,-1 50,3 46,-1" fill="#f0abfc" stroke="#581c87" strokeWidth="0.8" />
            {/* 2 hạt ngọc hai bên vương miện */}
            <circle cx="32" cy="-1" r="2" fill="#c084fc" stroke="#fef08a" strokeWidth="0.6" />
            <circle cx="68" cy="-1" r="2" fill="#c084fc" stroke="#fef08a" strokeWidth="0.6" />

            {/* DẢI LỤA HOÀNG GIA TỬ KIM 2 BÊN VIỀN */}
            <path d="M12 30 Q4 50 14 70 Q18 52 16 38 Z" fill={`url(#purple_sash_${uid})`} stroke="#fde047" strokeWidth="1" />
            <path d="M88 30 Q96 50 86 70 Q82 52 84 38 Z" fill={`url(#purple_sash_${uid})`} stroke="#fde047" strokeWidth="1" />

            {/* 4 hạt tử tinh lơ lửng phát sáng */}
            <circle cx="10" cy="50" r="2.2" fill="#f5d0fe" stroke="#a855f7" strokeWidth="0.6" />
            <circle cx="90" cy="50" r="2.2" fill="#f5d0fe" stroke="#a855f7" strokeWidth="0.6" />
            <circle cx="20" cy="78" r="2" fill="#fde047" />
            <circle cx="80" cy="78" r="2" fill="#fde047" />

            {/* Huy hiệu Đạo Hữu Bền Bỉ */}
            <circle cx="50" cy="91" r="9" fill="#3b0764" stroke="#fde047" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fef08a">Ⅲ</text>
          </g>
        );

      // Cấp 4: Tiên lộ dài lâu (Cửu Tiêu Thái Hoàng Kim Luân - Vạn Cổ Trường Sinh - 2700 Đạo hạnh - ĐỈNH CAO)
      case "journey":
        return (
          <g className="frame-art-journey">
            <defs>
              <linearGradient id={`imper_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="35%" stopColor="#fde047" />
                <stop offset="70%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id={`dragon_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
            </defs>

            {/* VÒNG THÁI DƯƠNG THẦN LUÂN HOÀNG KIM CỰC ĐẠI */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#imper_gold_${uid})`} strokeWidth="4.2" />

            {/* 12 TIA LỬA THÁI DƯƠNG QUANG MANG TOẢ RẠNG */}
            <g className="avatar-anim-spin-slow">
              <polygon points="50,-6 53,4 47,4" fill="#fef08a" />
              <polygon points="76,1 74,10 69,7" fill="#fde047" />
              <polygon points="96,17 90,23 87,18" fill="#fef08a" />
              <polygon points="106,50 96,53 96,47" fill="#fde047" />
              <polygon points="96,83 87,82 90,77" fill="#fef08a" />
              <polygon points="76,99 69,93 74,90" fill="#fde047" />
              <polygon points="50,106 47,96 53,96" fill="#fef08a" />
              <polygon points="24,99 26,90 31,93" fill="#fde047" />
              <polygon points="4,83 13,77 10,82" fill="#fef08a" />
              <polygon points="-6,50 4,47 4,53" fill="#fde047" />
              <polygon points="4,17 10,18 13,23" fill="#fef08a" />
              <polygon points="24,1 31,7 26,10" fill="#fde047" />
            </g>

            {/* VÒNG PHÙ VĂN THIÊN ĐẠO XOAY NGƯỢC CHIỀU */}
            <circle cx="50" cy="50" r="49" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 4 8 4" className="avatar-anim-spin-reverse" />

            {/* VƯƠNG MIỆN CỬU TIÊU ĐẾ TÔN TRÊN ĐỈNH */}
            <path d="M22 6 L30 -5 L40 4 L50 -9 L60 4 L70 -5 L78 6 L68 11 L50 8 L32 11 Z" fill={`url(#imper_gold_${uid})`} stroke="#78350f" strokeWidth="1.4" />
            <circle cx="50" cy="-4" r="3.2" fill="#dc2626" stroke="#fef08a" strokeWidth="1" />
            <circle cx="30" cy="-2" r="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.6" />
            <circle cx="70" cy="-2" r="2" fill="#38bdf8" stroke="#ffffff" strokeWidth="0.6" />

            {/* SONG LONG HOÀNG KIM HỘ VỆ 2 BÊN */}
            {/* Rồng vàng bên trái */}
            <path d="M12 25 Q-4 40 4 65 Q12 50 14 35 Z" fill={`url(#dragon_gold_${uid})`} stroke="#b45309" strokeWidth="1" />
            <polygon points="6,30 0,26 4,36" fill="#fef08a" />
            {/* Rồng vàng bên phải */}
            <path d="M88 25 Q104 40 96 65 Q88 50 86 35 Z" fill={`url(#dragon_gold_${uid})`} stroke="#b45309" strokeWidth="1" />
            <polygon points="94,30 100,26 96,36" fill="#fef08a" />

            {/* DẢI MÂY CÁT TƯỜNG HOÀNG GIA Ở ĐÁY */}
            <path d="M22 94 Q35 85 50 89 Q65 85 78 94 Q65 102 50 99 Q35 102 22 94 Z" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.4" />

            {/* Huy hiệu Tiên Lộ Dài Lâu */}
            <circle cx="50" cy="91" r="9.5" fill="#451a03" stroke="#fef08a" strokeWidth="2.4" />
            <text x="50" y="95" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#fffbeb">Ⅳ</text>
          </g>
        );

      // =========================================================================
      // ĐẶC BIỆT (SPECIAL) - ĐỈNH CAO THẦN THÔNG TU TIÊN
      // =========================================================================

      // Cấp 1: Liên hoa (Cửu Phẩm Hỗn Độn Thanh Liên / Tịnh Thế Hồng Liên - 80 Đạo hạnh)
      case "lotus":
        return (
          <g className="frame-art-lotus">
            <defs>
              <linearGradient id={`lotus_p1_${uid}`} x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#9f1239" />
                <stop offset="50%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#fecdd3" />
              </linearGradient>
              <linearGradient id={`lotus_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            {/* Vòng hào quang tiên khí hồng liên */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#fb7185" strokeWidth="3" />
            <circle cx="50" cy="50" r="47.5" fill="none" stroke="#fbcfe8" strokeWidth="1" strokeDasharray="6 3" className="avatar-anim-spin" />

            {/* Lớp cánh sen nở rực rỡ bên dưới - Cửu Phẩm Liên Đài */}
            {/* Cánh sen xòe 2 bên vươn cao */}
            <path d="M12 68 Q0 78 8 92 Q22 84 24 72 Z" fill={`url(#lotus_p1_${uid})`} stroke="#fecdd3" strokeWidth="1" />
            <path d="M88 68 Q100 78 92 92 Q78 84 76 72 Z" fill={`url(#lotus_p1_${uid})`} stroke="#fecdd3" strokeWidth="1" />
            {/* Cánh sen tầng trung */}
            <path d="M22 75 Q16 92 32 102 Q38 88 32 78 Z" fill={`url(#lotus_p1_${uid})`} stroke="#ffe4e6" strokeWidth="1.2" />
            <path d="M78 75 Q84 92 68 102 Q62 88 68 78 Z" fill={`url(#lotus_p1_${uid})`} stroke="#ffe4e6" strokeWidth="1.2" />
            {/* Cánh sen chính ở tâm đáy đài sen */}
            <path d="M36 82 Q50 108 64 82 Q57 90 50 91 Q43 90 36 82 Z" fill="#e11d48" stroke="#fecdd3" strokeWidth="1.2" />
            <path d="M42 84 Q50 102 58 84 Z" fill={`url(#lotus_gold_${uid})`} />

            {/* Đóa sen búp trên đỉnh đầu */}
            <path d="M50 -4 Q56 4 50 10 Q44 4 50 -4 Z" fill={`url(#lotus_p1_${uid})`} stroke="#fecdd3" strokeWidth="1" />
            <path d="M43 0 Q48 6 46 10 Q40 5 43 0 Z" fill="#fda4af" />
            <path d="M57 0 Q52 6 54 10 Q60 5 57 0 Z" fill="#fda4af" />

            {/* Giọt sương linh dịch ngọc bích lấp lánh */}
            <circle cx="8" cy="92" r="2" fill="#a7f3d0" stroke="#059669" strokeWidth="0.6" />
            <circle cx="92" cy="92" r="2" fill="#a7f3d0" stroke="#059669" strokeWidth="0.6" />
            <circle cx="32" cy="102" r="2.2" fill="#fef08a" />
            <circle cx="68" cy="102" r="2.2" fill="#fef08a" />
            <circle cx="50" cy="-4" r="2" fill="#fef08a" />

            {/* Đài sen tịnh thế ở tâm đáy */}
            <circle cx="50" cy="91" r="8" fill="#881337" stroke="#fef08a" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff1f2">❀</text>
          </g>
        );

      // Cấp 2: Kiếm trận (Vạn Kiếm Quy Tông - Bát Đại Tiên Kiếm Trận - 380 Đạo hạnh)
      case "swords":
        return (
          <g className="frame-art-swords">
            <defs>
              <linearGradient id={`blade_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
              <linearGradient id={`hilt_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            {/* Vòng kiếm khí thanh thiên */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#38bdf8" strokeWidth="3.2" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#7dd3fc" strokeWidth="1.2" strokeDasharray="8 4" className="avatar-anim-spin" />
            
            {/* Bát Đại Phi Kiếm - 8 thanh thần kiếm xoay quanh viền */}
            <g className="avatar-anim-spin-slow">
              {/* Kiếm 1: Hướng 12h (Trên đỉnh) */}
              <g transform="translate(50, 4) rotate(0)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>

              {/* Kiếm 2: Hướng 1h30 (Đông Bắc) */}
              <g transform="translate(83, 17) rotate(45)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>

              {/* Kiếm 3: Hướng 3h (Đông) */}
              <g transform="translate(96, 50) rotate(90)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>

              {/* Kiếm 4: Hướng 4h30 (Đông Nam) */}
              <g transform="translate(83, 83) rotate(135)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>

              {/* Kiếm 5: Hướng 6h (Dưới đáy) */}
              <g transform="translate(50, 96) rotate(180)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>

              {/* Kiếm 6: Hướng 7h30 (Tây Nam) */}
              <g transform="translate(17, 83) rotate(225)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>

              {/* Kiếm 7: Hướng 9h (Tây) */}
              <g transform="translate(4, 50) rotate(270)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>

              {/* Kiếm 8: Hướng 10h30 (Tây Bắc) */}
              <g transform="translate(17, 17) rotate(315)">
                <polygon points="0,-10 3.5,4 0,3 -3.5,4" fill={`url(#blade_${uid})`} stroke="#0284c7" strokeWidth="0.7" />
                <line x1="-5" y1="4" x2="5" y2="4" stroke={`url(#hilt_${uid})`} strokeWidth="1.8" />
                <rect x="-1" y="4" width="2" height="6" fill={`url(#hilt_${uid})`} />
                <circle cx="0" cy="11" r="1.5" fill="#fef08a" />
              </g>
            </g>

            {/* Trận nhãn Kiếm Trận */}
            <circle cx="50" cy="91" r="8.5" fill="#0c4a6e" stroke="#7dd3fc" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f0f9ff">⚔</text>
          </g>
        );

      // Cấp 3: Âm dương (Thái Cực Song Ngư Bát Quái Thần Trận - 640 Đạo hạnh)
      case "yin-yang":
        return (
          <g className="frame-art-yin-yang">
            <defs>
              <linearGradient id={`white_fish_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
              <linearGradient id={`black_fish_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#090d16" />
              </linearGradient>
            </defs>
            {/* Vòng nền thái cực huyền ảo */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#64748b" strokeWidth="3.2" />

            {/* BẠCH NGƯ (Cá Trắng) - Nửa trên uốn lượn thướt tha */}
            <path
              d="M48 4 C72 -2, 98 22, 98 50 C98 35, 82 20, 68 15 C54 10, 42 16, 32 10 C40 6, 44 4, 48 4 Z"
              fill={`url(#white_fish_${uid})`}
              stroke="#f8fafc"
              strokeWidth="0.8"
            />
            {/* Vây cá trắng mềm mại xòe ra */}
            <path d="M78 8 Q94 2 92 18 Q84 14 78 8 Z" fill="#ffffff" opacity="0.9" />
            {/* Mắt cá trắng (Hắc Nhãn) */}
            <circle cx="68" cy="18" r="2.8" fill="#0f172a" stroke="#ffffff" strokeWidth="0.8" />

            {/* HẮC NGƯ (Cá Đen) - Nửa dưới uốn lượn thướt tha */}
            <path
              d="M52 96 C28 102, 2 78, 2 50 C2 65, 18 80, 32 85 C46 90, 58 84, 68 90 C60 94, 56 96, 52 96 Z"
              fill={`url(#black_fish_${uid})`}
              stroke="#6366f1"
              strokeWidth="0.8"
            />
            {/* Vây cá đen xòe ra */}
            <path d="M22 92 Q6 98 8 82 Q16 86 22 92 Z" fill="#4338ca" opacity="0.9" />
            {/* Mắt cá đen (Bạch Nhãn) */}
            <circle cx="32" cy="82" r="2.8" fill="#f8fafc" stroke="#312e81" strokeWidth="0.8" />

            {/* 8 Quẻ Bát Quái dát vàng xoay quanh */}
            <g className="avatar-anim-spin-slow" fill="#fbbf24" fontSize="5.5" fontWeight="bold" textAnchor="middle">
              <text x="50" y="1">☰</text>
              <text x="86" y="14">☱</text>
              <text x="103" y="52">☲</text>
              <text x="86" y="89">☳</text>
              <text x="50" y="103">☷</text>
              <text x="14" y="89">☶</text>
              <text x="-3" y="52">☵</text>
              <text x="14" y="14">☴</text>
            </g>

            {/* Trận nhãn Thái Cực */}
            <circle cx="50" cy="91" r="8.5" fill="#090d16" stroke="#fbbf24" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#f8fafc">☯</text>
          </g>
        );

      // Cấp 4: Thiên cơ trận (Chu Thiên Tinh Đấu Thần Cơ Đại Trận - 980 Đạo hạnh)
      case "formation":
        return (
          <g className="frame-art-formation">
            <defs>
              <linearGradient id={`gear_gold_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="50%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </linearGradient>
              <linearGradient id={`rune_purple_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f0abfc" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
            </defs>
            {/* Vòng năng lượng thiên cơ */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#c084fc" strokeWidth="3.6" />

            {/* TẦNG 1: VÒNG BÁNH RĂNG CƠ QUAN THIÊN CƠ (Ngoài cùng - Vàng Kim) */}
            <g className="avatar-anim-spin-slow">
              <circle cx="50" cy="50" r="51.5" fill="none" stroke={`url(#gear_gold_${uid})`} strokeWidth="2" strokeDasharray="4 6" />
              {/* 8 răng cưa thiên cơ lớn nhô ra ngoài */}
              <polygon points="50,-3 53,2 47,2" fill="#fde047" />
              <polygon points="86,14 86,19 82,16" fill="#fde047" />
              <polygon points="103,50 98,53 98,47" fill="#fde047" />
              <polygon points="86,86 82,84 86,81" fill="#fde047" />
              <polygon points="50,103 47,98 53,98" fill="#fde047" />
              <polygon points="14,86 14,81 18,84" fill="#fde047" />
              <polygon points="-3,50 2,47 2,53" fill="#fde047" />
              <polygon points="14,14 18,16 14,19" fill="#fde047" />
            </g>

            {/* TẦNG 2: VÒNG PHÙ VĂN CỔ ĐẠI THẦN TỘC (Xoay ngược chiều - Tím Neon) */}
            <g className="avatar-anim-spin-reverse">
              <circle cx="50" cy="50" r="47.5" fill="none" stroke={`url(#rune_purple_${uid})`} strokeWidth="1.6" strokeDasharray="2 3 6 3" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e879f9" strokeWidth="0.8" strokeDasharray="1 5" />
            </g>

            {/* TẦNG 3: BÁT GIÁC LINH TRẬN BÀN NỘI BỘ (Chồng 2 hình vuông) */}
            <polygon points="50,2 98,50 50,98 2,50" fill="none" stroke="#f0abfc" strokeWidth="1.2" opacity="0.85" />
            <polygon points="84,16 84,84 16,84 16,16" fill="none" stroke="#fde047" strokeWidth="1.2" opacity="0.85" />

            {/* 4 TRỤ TINH THỂ PHONG ẤN THIÊN CƠ TỨ PHƯƠNG */}
            <polygon points="50,-4 54,2 50,7 46,2" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
            <polygon points="104,50 98,54 93,50 98,46" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
            <polygon points="50,104 46,98 50,93 54,98" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
            <polygon points="-4,50 2,46 7,50 2,54" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />

            {/* Trận nhãn Thiên Cơ Trận */}
            <circle cx="50" cy="91" r="9" fill="#581c87" stroke="#fde047" strokeWidth="2.2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#fef08a">阵</text>
          </g>
        );

      // Cấp 5: Tinh hà (Hỗn Độn Vô Tận Tinh Hà Vạn Giới Trận - 1420 Đạo hạnh - ĐỈNH CAO TỐI THƯỢNG)
      case "stars":
        return (
          <g className="frame-art-stars">
            <defs>
              <linearGradient id={`galaxy_arm1_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="40%" stopColor="#818cf8" />
                <stop offset="70%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
              <linearGradient id={`galaxy_arm2_${uid}`} x1="100%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="40%" stopColor="#a855f7" />
                <stop offset="80%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>
            </defs>

            {/* Vòng tinh hà hỗn độn */}
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#6366f1" strokeWidth="3.6" />

            {/* DẢI XOẮN NGÂN HÀ 1 (Galaxy Spiral Arm 1) */}
            <path
              d="M10 24 C22 -4, 76 -6, 96 18 C106 32, 102 52, 90 64 C82 72, 65 78, 52 74 C66 68, 86 62, 88 44 C90 28, 72 10, 48 8 C28 6, 12 16, 10 24 Z"
              fill={`url(#galaxy_arm1_${uid})`}
              opacity="0.9"
            />

            {/* DẢI XOẮN NGÂN HÀ 2 (Galaxy Spiral Arm 2) */}
            <path
              d="M90 76 C78 104, 24 106, 4 82 C-6 68, -2 48, 10 36 C18 28, 35 22, 48 26 C34 32, 14 38, 12 56 C10 72, 28 90, 52 92 C72 94, 88 84, 90 76 Z"
              fill={`url(#galaxy_arm2_${uid})`}
              opacity="0.9"
            />

            {/* Vành đai thiên hà xoay quanh */}
            <circle cx="50" cy="50" r="49" fill="none" stroke="#e0e7ff" strokeWidth="1.2" strokeDasharray="3 6" className="avatar-anim-spin" />
            <circle cx="50" cy="50" r="52.5" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="8 4" className="avatar-anim-spin-reverse" />

            {/* 3 HÀNH TINH CÓ VÀNH ĐAI 3D */}
            {/* Hành tinh 1 (Đông Bắc) */}
            <g transform="translate(90, 18)">
              <circle cx="0" cy="0" r="3.5" fill="#a855f7" stroke="#e0e7ff" strokeWidth="0.8" />
              <ellipse cx="0" cy="0" rx="6.5" ry="2.2" fill="none" stroke="#fef08a" strokeWidth="1" transform="rotate(-25)" />
            </g>
            {/* Hành tinh 2 (Tây Nam) */}
            <g transform="translate(10, 82)">
              <circle cx="0" cy="0" r="3" fill="#06b6d4" stroke="#ffffff" strokeWidth="0.8" />
              <ellipse cx="0" cy="0" rx="5.5" ry="1.8" fill="none" stroke="#67e8f9" strokeWidth="0.8" transform="rotate(30)" />
            </g>
            {/* Hành tinh 3 (Tây Bắc) */}
            <circle cx="16" cy="18" r="2.2" fill="#fbbf24" stroke="#ffffff" strokeWidth="0.6" />

            {/* VỆT SAO BĂNG THÁI HƯ (Shooting Star Comet) */}
            <path d="M52 3 Q70 6 86 14" fill="none" stroke="#fef08a" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="86" cy="14" r="2.2" fill="#ffffff" />

            {/* 4 NGÔI SAO SIÊU TÂN TINH 8 CÁNH CHÓI LÒA */}
            {/* Sao trên đỉnh */}
            <g transform="translate(50, -3)">
              <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#ffffff" stroke="#fef08a" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.5" fill="#fef08a" />
            </g>
            {/* Sao bên phải */}
            <g transform="translate(104, 48)">
              <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#ffffff" stroke="#38bdf8" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.3" fill="#38bdf8" />
            </g>
            {/* Sao bên trái */}
            <g transform="translate(-4, 52)">
              <polygon points="0,-6 1.8,-1.8 6,0 1.8,1.8 0,6 -1.8,1.8 -6,0 -1.8,-1.8" fill="#ffffff" stroke="#c084fc" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="1.3" fill="#c084fc" />
            </g>

            {/* Các vì sao tinh tú nhấp nháy */}
            <circle cx="28" cy="6" r="1.4" fill="#ffffff" />
            <circle cx="76" cy="4" r="1.2" fill="#fef08a" />
            <circle cx="98" cy="35" r="1.5" fill="#ffffff" />
            <circle cx="98" cy="68" r="1.2" fill="#38bdf8" />
            <circle cx="72" cy="96" r="1.5" fill="#ffffff" />
            <circle cx="26" cy="95" r="1.2" fill="#fef08a" />
            <circle cx="2" cy="36" r="1.4" fill="#ffffff" />
            <circle cx="2" cy="68" r="1.2" fill="#c084fc" />

            {/* Trận nhãn Tinh Hà */}
            <circle cx="50" cy="91" r="9.5" fill="#1e1b4b" stroke="#fde047" strokeWidth="2.4" />
            <text x="50" y="95" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">✶</text>
          </g>
        );

      // Mặc định fallback
      default:
        return (
          <g>
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2.8" />
            {shape === "ring" && (
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="7 4" />
            )}
            <circle cx="50" cy="91" r="8" fill="#161b24" stroke="currentColor" strokeWidth="1.5" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fill="currentColor">
              {symbol}
            </text>
          </g>
        );
    }
  };

  return (
    <svg
      className={`avatar-frame-art avatar-frame-art--${frameId} avatar-frame-art--${shape}`}
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{ color }}
    >
      <title>{name}</title>
      {renderFrameContent()}
    </svg>
  );
}
