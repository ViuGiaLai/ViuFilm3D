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
      case "fire":
        return (
          <g className="frame-art-fire">
            <defs>
              <linearGradient id={`fire_${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="43.5" fill="none" stroke={`url(#fire_${uid})`} strokeWidth="3.6" />
            {/* Lửa bốc cháy quanh viền */}
            <path d="M50 -3 Q56 8 46 9 Q54 2 50 -3 Z" fill="#f97316" />
            <path d="M85 15 Q82 26 73 20 Q83 18 85 15 Z" fill="#f97316" />
            <path d="M103 50 Q93 56 93 45 Q99 53 103 50 Z" fill="#f97316" />
            <path d="M85 85 Q75 80 82 72 Q84 81 85 85 Z" fill="#dc2626" />
            <path d="M15 85 Q25 80 18 72 Q16 81 15 85 Z" fill="#dc2626" />
            <path d="M-3 50 Q7 45 7 56 Q1 48 -3 50 Z" fill="#f97316" />
            <path d="M15 15 Q18 26 27 20 Q17 18 15 15 Z" fill="#f97316" />
            {/* Đốm lửa */}
            <circle cx="50" cy="91" r="8" fill="#7f1d1d" stroke="#f97316" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fef08a">火</text>
          </g>
        );

      case "ice":
        return (
          <g className="frame-art-ice">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#38bdf8" strokeWidth="3" />
            <polygon points="50,1 54,8 50,14 46,8" fill="#e0f2fe" />
            <polygon points="99,50 92,54 86,50 92,46" fill="#e0f2fe" />
            <polygon points="50,99 46,92 50,86 54,92" fill="#e0f2fe" />
            <polygon points="1,50 8,46 14,50 8,54" fill="#e0f2fe" />
            {/* Gai băng 4 góc */}
            <polygon points="85,15 78,21 82,24" fill="#7dd3fc" />
            <polygon points="85,85 78,79 82,76" fill="#7dd3fc" />
            <polygon points="15,85 22,79 18,76" fill="#7dd3fc" />
            <polygon points="15,15 22,21 18,24" fill="#7dd3fc" />
            <circle cx="50" cy="91" r="8" fill="#0369a1" stroke="#bae6fd" strokeWidth="1.6" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f0f9ff">❄</text>
          </g>
        );

      case "thunder":
        return (
          <g className="frame-art-thunder">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#a855f7" strokeWidth="3.2" />
            <path d="M48 2 L52 10 L46 13 L54 21" fill="none" stroke="#c084fc" strokeWidth="2" className="avatar-anim-flash" />
            <path d="M98 48 L90 52 L87 46 L79 54" fill="none" stroke="#c084fc" strokeWidth="2" className="avatar-anim-flash" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#e9d5ff" strokeWidth="1.2" strokeDasharray="4 4" className="avatar-anim-spin" />
            <circle cx="50" cy="91" r="8" fill="#581c87" stroke="#e9d5ff" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#faf5ff">ϟ</text>
          </g>
        );

      case "wind":
        return (
          <g className="frame-art-wind">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#34d399" strokeWidth="3" />
            {/* Lốc xoáy 4 phiến gió */}
            <path d="M50 3 Q68 12 75 25 Q62 20 50 3 Z" fill="#6ee7b7" />
            <path d="M97 50 Q88 68 75 75 Q80 62 97 50 Z" fill="#6ee7b7" />
            <path d="M50 97 Q32 88 25 75 Q38 80 50 97 Z" fill="#6ee7b7" />
            <path d="M3 50 Q12 32 25 25 Q20 38 3 50 Z" fill="#6ee7b7" />
            <circle cx="50" cy="91" r="8" fill="#065f46" stroke="#a7f3d0" strokeWidth="1.6" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#ecfdf5">彡</text>
          </g>
        );

      case "water":
        return (
          <g className="frame-art-water">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#38bdf8" strokeWidth="3" />
            {/* Sóng nước cuộn ở chân */}
            <path d="M20 90 Q35 80 50 86 Q65 80 80 90 Q65 98 50 94 Q35 98 20 90 Z" fill="#0284c7" stroke="#bae6fd" strokeWidth="1" />
            {/* Trăng khuyết ở góc trên */}
            <path d="M78 8 Q86 16 80 24 Q82 16 78 8 Z" fill="#fef08a" />
            <circle cx="50" cy="91" r="8" fill="#0c4a6e" stroke="#7dd3fc" strokeWidth="1.6" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#f0f9ff">水</text>
          </g>
        );

      case "shadow":
        return (
          <g className="frame-art-shadow">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#7c3aed" strokeWidth="3.4" />
            {/* Cánh quỷ ma ảnh */}
            <path d="M15 25 Q5 8 18 5 Q16 18 25 20 Z" fill="#581c87" stroke="#c084fc" strokeWidth="1" />
            <path d="M85 25 Q95 8 82 5 Q84 18 75 20 Z" fill="#581c87" stroke="#c084fc" strokeWidth="1" />
            <circle cx="50" cy="91" r="8" fill="#2e1065" stroke="#a855f7" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#f5f3ff">魔</text>
          </g>
        );

      case "light":
        return (
          <g className="frame-art-light">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#fbbf24" strokeWidth="3.2" />
            {/* Ngôi sao 8 hướng thánh khiết */}
            <polygon points="50,-2 52,7 50,14 48,7" fill="#fef08a" />
            <polygon points="102,50 93,52 86,50 93,48" fill="#fef08a" />
            <polygon points="50,102 48,93 50,86 52,93" fill="#fef08a" />
            <polygon points="-2,50 7,48 14,50 7,52" fill="#fef08a" />
            <circle cx="50" cy="91" r="8" fill="#78350f" stroke="#fef08a" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fefce8">✦</text>
          </g>
        );

      // =========================================================================
      // LINH THÚ (BEASTS)
      // =========================================================================
      case "dragon":
        return (
          <g className="frame-art-dragon">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#10b981" strokeWidth="3.5" />
            {/* Sừng và râu rồng ở đỉnh */}
            <path d="M35 12 Q28 0 20 -2 Q30 4 36 10 Z" fill="#6ee7b7" stroke="#047857" strokeWidth="1" />
            <path d="M65 12 Q72 0 80 -2 Q70 4 64 10 Z" fill="#6ee7b7" stroke="#047857" strokeWidth="1" />
            {/* Móng rồng hai bên */}
            <path d="M5 45 L-2 42 L3 50 L-2 58 L5 55 Z" fill="#a7f3d0" stroke="#065f46" strokeWidth="1" />
            <path d="M95 45 L102 42 L97 50 L102 58 L95 55 Z" fill="#a7f3d0" stroke="#065f46" strokeWidth="1" />
            {/* Long châu ở đáy */}
            <circle cx="50" cy="91" r="8.5" fill="#064e3b" stroke="#34d399" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ecfdf5">龍</text>
          </g>
        );

      case "phoenix":
        return (
          <g className="frame-art-phoenix">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#f97316" strokeWidth="3.5" />
            {/* Đôi cánh phượng hoàng */}
            <path d="M8 35 Q-10 20 -4 5 Q5 16 15 25 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" />
            <path d="M92 35 Q110 20 104 5 Q95 16 85 25 Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.2" />
            {/* Mào phượng hoàng trên đỉnh */}
            <polygon points="50,1 53,8 60,3 55,11 50,9 45,11 40,3 47,8" fill="#fef08a" stroke="#c2410c" strokeWidth="1" />
            <circle cx="50" cy="91" r="8.5" fill="#7c2d12" stroke="#fbbf24" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fff7ed">雀</text>
          </g>
        );

      case "tiger":
        return (
          <g className="frame-art-tiger">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#cbd5e1" strokeWidth="3.2" />
            {/* Móng vuốt thần hổ trắng */}
            <polygon points="6,38 0,44 6,50 0,56 6,62" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
            <polygon points="94,38 100,44 94,50 100,56 94,62" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
            {/* Tai hổ và chữ Vương ở đỉnh */}
            <polygon points="32,8 24,0 36,4" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
            <polygon points="68,8 76,0 64,4" fill="#e2e8f0" stroke="#334155" strokeWidth="1" />
            <circle cx="50" cy="91" r="8" fill="#1e293b" stroke="#f1f5f9" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#f8fafc">虎</text>
          </g>
        );

      case "turtle":
        return (
          <g className="frame-art-turtle">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#0d9488" strokeWidth="3.5" />
            {/* Mai rùa 6 cạnh */}
            <polygon points="50,3 85,15 97,50 85,85 50,97 15,85 3,50 15,15" fill="none" stroke="#5eead4" strokeWidth="1.4" strokeDasharray="6 3" />
            <circle cx="50" cy="91" r="8" fill="#134e4a" stroke="#2dd4bf" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#f0fdfa">玄</text>
          </g>
        );

      case "fox":
        return (
          <g className="frame-art-fox">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#f472b6" strokeWidth="3" />
            {/* Đôi tai hồ ly hồng phấn */}
            <polygon points="32,10 22,-2 36,4" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.2" />
            <polygon points="68,10 78,-2 64,4" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.2" />
            <polygon points="30,8 25,2 33,6" fill="#be185d" />
            <polygon points="70,8 75,2 67,6" fill="#be185d" />
            {/* 3 đuôi cáo ở chân */}
            <path d="M25 90 Q15 98 25 102 Q35 98 28 92 Z" fill="#fda4af" />
            <path d="M75 90 Q85 98 75 102 Q65 98 72 92 Z" fill="#fda4af" />
            <circle cx="50" cy="91" r="8" fill="#831843" stroke="#f472b6" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fff1f2">狐</text>
          </g>
        );

      case "qilin":
        return (
          <g className="frame-art-qilin">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#eab308" strokeWidth="3.4" />
            {/* Sừng kỳ lân vàng kim uy nghiêm */}
            <polygon points="50,-6 54,6 46,6" fill="#fde047" stroke="#a16207" strokeWidth="1" />
            <circle cx="50" cy="-4" r="2" fill="#ef4444" />
            {/* Mây lành cát tường 2 bên */}
            <path d="M12 40 Q4 35 8 28 Q15 28 16 35 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <path d="M88 40 Q96 35 92 28 Q85 28 84 35 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="50" cy="91" r="8.5" fill="#713f12" stroke="#fde047" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fefce8">麟</text>
          </g>
        );

      // =========================================================================
      // ĐẠO HẠNH (ACHIEVEMENTS)
      // =========================================================================
      case "beginner":
        return (
          <g className="frame-art-beginner">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#6ee7b7" strokeWidth="2.8" />
            <circle cx="50" cy="91" r="7.5" fill="#065f46" stroke="#a7f3d0" strokeWidth="1.5" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#ecfdf5">Ⅰ</text>
          </g>
        );

      case "companion":
        return (
          <g className="frame-art-companion">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#60a5fa" strokeWidth="3" />
            <polygon points="10,45 2,50 10,55" fill="#93c5fd" />
            <polygon points="90,45 98,50 90,55" fill="#93c5fd" />
            <circle cx="50" cy="91" r="7.5" fill="#1e40af" stroke="#bfdbfe" strokeWidth="1.6" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#eff6ff">Ⅱ</text>
          </g>
        );

      case "devoted":
        return (
          <g className="frame-art-devoted">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#c084fc" strokeWidth="3.2" />
            <polygon points="50,1 55,7 45,7" fill="#f3e8ff" stroke="#9333ea" strokeWidth="1" />
            <circle cx="50" cy="91" r="8" fill="#581c87" stroke="#e9d5ff" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#faf5ff">Ⅲ</text>
          </g>
        );

      case "journey":
        return (
          <g className="frame-art-journey">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#fbbf24" strokeWidth="3.6" />
            <polygon points="50,-2 54,6 62,2 57,10 50,8 43,10 38,2 46,6" fill="#fef08a" stroke="#b45309" strokeWidth="1" />
            <circle cx="50" cy="91" r="8.5" fill="#78350f" stroke="#fde047" strokeWidth="2" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fefce8">Ⅳ</text>
          </g>
        );

      // =========================================================================
      // ĐẶC BIỆT (SPECIAL)
      // =========================================================================
      case "lotus":
        return (
          <g className="frame-art-lotus">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#f472b6" strokeWidth="3.2" />
            {/* Đóa sen hồng ngọc nở rực rỡ ở đáy */}
            <path d="M28 92 Q40 78 50 82 Q60 78 72 92 Q60 100 50 96 Q40 100 28 92 Z" fill="#f43f5e" stroke="#fbcfe8" strokeWidth="1.2" />
            <path d="M36 88 Q50 74 64 88 Z" fill="#fda4af" />
            <polygon points="50,2 53,8 50,13 47,8" fill="#fda4af" />
            <circle cx="50" cy="90" r="7.5" fill="#881337" stroke="#fda4af" strokeWidth="1.5" />
            <text x="50" y="93.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#fff1f2">❀</text>
          </g>
        );

      case "swords":
        return (
          <g className="frame-art-swords">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#38bdf8" strokeWidth="3.2" />
            {/* 6 thanh phi kiếm trấn quanh viền */}
            <g className="avatar-anim-spin-slow">
              <polygon points="50,-3 52,10 48,10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
              <polygon points="96,25 85,32 87,28" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
              <polygon points="96,75 87,72 85,68" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
              <polygon points="50,103 48,90 52,90" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
              <polygon points="4,75 15,68 13,72" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
              <polygon points="4,25 13,28 15,32" fill="#e0f2fe" stroke="#0284c7" strokeWidth="0.8" />
            </g>
            <circle cx="50" cy="91" r="8" fill="#075985" stroke="#bae6fd" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#f0f9ff">⚔</text>
          </g>
        );

      case "yin-yang":
        return (
          <g className="frame-art-yin-yang">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#94a3b8" strokeWidth="3" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#f1f5f9" strokeWidth="1.2" strokeDasharray="8 4" className="avatar-anim-spin" />
            <circle cx="50" cy="91" r="8" fill="#0f172a" stroke="#f8fafc" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#f8fafc">☯</text>
          </g>
        );

      case "formation":
        return (
          <g className="frame-art-formation">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#a855f7" strokeWidth="3.4" />
            <circle cx="50" cy="50" r="48" fill="none" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="3 5" className="avatar-anim-spin" />
            <circle cx="50" cy="50" r="51" fill="none" stroke="#e9d5ff" strokeWidth="0.8" strokeDasharray="10 4" className="avatar-anim-spin-reverse" />
            <circle cx="50" cy="91" r="8" fill="#581c87" stroke="#e9d5ff" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#faf5ff">阵</text>
          </g>
        );

      case "stars":
        return (
          <g className="frame-art-stars">
            <circle cx="50" cy="50" r="43.5" fill="none" stroke="#818cf8" strokeWidth="3.2" />
            <g className="avatar-anim-spin-slow">
              <polygon points="50,1 52,7 58,7 53,10 55,16 50,12 45,16 47,10 42,7 48,7" fill="#fef08a" />
              <circle cx="85" cy="20" r="2" fill="#c7d2fe" />
              <circle cx="95" cy="50" r="1.5" fill="#fef08a" />
              <circle cx="85" cy="80" r="2" fill="#c7d2fe" />
              <circle cx="15" cy="80" r="2" fill="#c7d2fe" />
              <circle cx="5" cy="50" r="1.5" fill="#fef08a" />
              <circle cx="15" cy="20" r="2" fill="#c7d2fe" />
            </g>
            <circle cx="50" cy="91" r="8" fill="#312e81" stroke="#c7d2fe" strokeWidth="1.8" />
            <text x="50" y="94.5" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#e0e7ff">✶</text>
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
