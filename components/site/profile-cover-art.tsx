"use client";

import { useId } from "react";
import type { ProfileThemeConfig } from "@/lib/profile-themes";

type ProfileCoverArtProps = {
  theme: ProfileThemeConfig;
};

export function ProfileCoverArt({ theme }: ProfileCoverArtProps) {
  const uid = useId().replace(/:/g, "_");

  const renderMotif = () => {
    switch (theme.motifType) {
      // -----------------------------------------------------------------------
      // KỲ LÂN (QILIN) - HOÀNG CỰC THỤY THÚ & THÁI DƯƠNG KIM QUANG
      // -----------------------------------------------------------------------
      case "qilin":
        return (
          <g className="motif-qilin">
            <defs>
              <linearGradient id={`qilin_sun_${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
            </defs>

            {/* Thái Dương Kim Luân khổng lồ xoay chậm bên phải */}
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="3" />
              <circle cx="0" cy="0" r="100" fill="none" stroke="rgba(254, 240, 138, 0.35)" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="0" cy="0" r="80" fill="none" stroke="rgba(245, 158, 11, 0.28)" strokeWidth="2" strokeDasharray="16 8" />
              <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(254, 240, 138, 0.4)" strokeWidth="1.5" strokeDasharray="4 4" />
              {/* 16 Tia sáng Thái Dương */}
              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
                <polygon
                  key={deg}
                  points="0,-132 6,-110 -6,-110"
                  fill="rgba(254, 240, 138, 0.38)"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Ngũ Sắc Tường Vân cuộn trào chân trời */}
            <g opacity="0.6">
              <path
                d="M380 240 Q470 195 560 215 Q650 175 750 205 Q850 165 970 195 Q1090 155 1200 185 L1200 280 L380 280 Z"
                fill={`url(#qilin_sun_${uid})`}
                opacity="0.35"
              />
              <path
                d="M520 250 Q640 210 760 230 Q880 190 1020 220 Q1120 185 1200 205 L1200 280 L520 280 Z"
                fill="#ec4899"
                opacity="0.22"
              />
              <path
                d="M680 260 Q780 225 900 240 Q1040 205 1200 225 L1200 280 L680 280 Z"
                fill="#38bdf8"
                opacity="0.25"
              />
            </g>

            {/* Đốm linh quang hoàng kim bay lượn */}
            <circle cx="850" cy="75" r="4" fill="#fef08a" className="avatar-anim-pulse" opacity="0.85" />
            <circle cx="980" cy="55" r="3" fill="#fde047" className="avatar-anim-pulse" opacity="0.75" />
            <circle cx="740" cy="115" r="3.5" fill="#fef08a" className="avatar-anim-pulse" opacity="0.7" />
            <circle cx="1070" cy="125" r="4.5" fill="#fbbf24" className="avatar-anim-pulse" opacity="0.8" />
            <circle cx="680" cy="165" r="2.5" fill="#fde047" opacity="0.6" />
            <circle cx="890" cy="205" r="3" fill="#fef08a" opacity="0.7" />
          </g>
        );

      // -----------------------------------------------------------------------
      // THANH LONG (DRAGON) - THẦN LONG BÀN HẢI & ẤT MỘC LÔI VÂN
      // -----------------------------------------------------------------------
      case "dragon":
        return (
          <g className="motif-dragon">
            {/* Vòng lôi vân thần long xoay chậm */}
            <g transform="translate(940, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="120" fill="none" stroke="rgba(52, 211, 153, 0.28)" strokeWidth="3" />
              <circle cx="0" cy="0" r="98" fill="none" stroke="rgba(110, 231, 183, 0.35)" strokeWidth="1.5" strokeDasharray="8 6" />
              <circle cx="0" cy="0" r="72" fill="none" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="18 10" />
            </g>

            {/* Thân Rồng vảy ngọc uốn lượn mờ ảo */}
            <path
              d="M480 220 Q640 135 810 175 Q970 115 1160 155"
              fill="none"
              stroke="rgba(52, 211, 153, 0.28)"
              strokeWidth="22"
              strokeLinecap="round"
            />
            <path
              d="M480 220 Q640 135 810 175 Q970 115 1160 155"
              fill="none"
              stroke="rgba(254, 240, 138, 0.5)"
              strokeWidth="2.5"
              strokeDasharray="5 9"
              strokeLinecap="round"
            />

            {/* Tia chớp kim lôi thiên kiếp */}
            <g className="avatar-anim-flash" opacity="0.75">
              <path d="M760 35 L800 85 L780 105 L830 155" fill="none" stroke="#fef08a" strokeWidth="2.5" />
              <path d="M1010 45 L1045 90 L1028 110 L1065 150" fill="none" stroke="#6ee7b7" strokeWidth="2.5" />
            </g>

            {/* Sóng nước biển ngọc bích ở đáy */}
            <path
              d="M420 250 Q580 210 740 235 Q900 185 1060 215 Q1150 190 1200 205 L1200 280 L420 280 Z"
              fill="rgba(16, 185, 129, 0.24)"
            />
          </g>
        );

      // -----------------------------------------------------------------------
      // CHU TƯỚC (PHOENIX) - NIẾT BÀN CHÂN HỎA
      // -----------------------------------------------------------------------
      case "phoenix":
        return (
          <g className="motif-phoenix">
            {/* Thái Dương Hỏa Luân xoay tròn */}
            <g transform="translate(930, 135)" className="avatar-anim-spin">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(249, 115, 22, 0.35)" strokeWidth="3" />
              <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(254, 240, 138, 0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <path
                  key={deg}
                  d="M0 -120 C 10 -98, -10 -80, 0 -65"
                  fill="none"
                  stroke="rgba(249, 115, 22, 0.45)"
                  strokeWidth="2.5"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>

            {/* Đôi Cánh Phượng Hoàng rực lửa sải rộng */}
            <path
              d="M700 180 C 750 75, 860 35, 980 55 C 940 95, 875 140, 820 180 Z"
              fill="rgba(249, 115, 22, 0.3)"
            />
            <path
              d="M780 190 C 840 95, 950 55, 1080 75 C 1035 115, 960 160, 905 195 Z"
              fill="rgba(239, 68, 68, 0.25)"
            />

            {/* Đốm tàn lửa bay lên */}
            <circle cx="750" cy="85" r="4" fill="#fef08a" className="avatar-anim-pulse" opacity="0.85" />
            <circle cx="870" cy="45" r="3.5" fill="#f97316" className="avatar-anim-pulse" opacity="0.8" />
            <circle cx="990" cy="75" r="4.5" fill="#fef08a" className="avatar-anim-pulse" opacity="0.8" />
            <circle cx="1070" cy="115" r="3" fill="#ef4444" opacity="0.7" />
          </g>
        );

      // -----------------------------------------------------------------------
      // BẠCH HỔ (TIGER) - CANH KIM SÁT KHÍ
      // -----------------------------------------------------------------------
      case "tiger":
        return (
          <g className="motif-tiger">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(203, 213, 225, 0.35)" strokeWidth="2.5" />
              <polygon points="0,-115 115,0 0,115 -115,0" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="1.5" />
              <polygon points="81,-81 81,81 -81,81 -81,-81" fill="none" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" strokeDasharray="6 4" />
            </g>
            {/* Vết cào hổ trảo Canh Kim */}
            <path d="M720 70 Q 820 120 920 190" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="3" strokeLinecap="round" />
            <path d="M740 50 Q 840 100 940 170" fill="none" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="3" strokeLinecap="round" />
            <path d="M760 30 Q 860 80 960 150" fill="none" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="3" strokeLinecap="round" />
          </g>
        );

      // -----------------------------------------------------------------------
      // HUYỀN VŨ (TURTLE) - BẮC MINH HẢI VỰC
      // -----------------------------------------------------------------------
      case "turtle":
        return (
          <g className="motif-turtle">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(20, 184, 166, 0.35)" strokeWidth="3" />
              <polygon points="0,-110 95,-55 95,55 0,110 -95,55 -95,-55" fill="none" stroke="rgba(94, 234, 212, 0.35)" strokeWidth="2" strokeDasharray="8 6" />
              <circle cx="0" cy="0" r="75" fill="none" stroke="rgba(20, 184, 166, 0.4)" strokeWidth="1.5" strokeDasharray="14 7" />
            </g>
            {/* Đại dương bắc minh cuộn sóng */}
            <path d="M420 245 Q 600 200 780 230 Q 960 185 1140 220 L 1200 225 L 1200 280 L 420 280 Z" fill="rgba(20, 184, 166, 0.25)" />
          </g>
        );

      // -----------------------------------------------------------------------
      // CỬU VĨ HỒ (FOX) - THANH KHÂU TIÊN CẢNH
      // -----------------------------------------------------------------------
      case "fox":
        return (
          <g className="motif-fox">
            {/* Hoa văn Thanh Khâu Mị Linh */}
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(244, 114, 182, 0.35)" strokeWidth="2" />
              <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(236, 72, 153, 0.4)" strokeWidth="1.5" strokeDasharray="8 6" />
              {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
                <path
                  key={deg}
                  d="M0 -115 Q 25 -70 0 -45 Q -25 -70 0 -115"
                  fill="rgba(244, 114, 182, 0.25)"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
            {/* Cánh hoa đào bay lượn */}
            <g className="avatar-anim-pulse" opacity="0.8">
              <circle cx="780" cy="65" r="4.5" fill="#f472b6" />
              <circle cx="890" cy="45" r="3.5" fill="#fbcfe8" />
              <circle cx="1020" cy="75" r="4" fill="#f472b6" />
              <circle cx="1110" cy="115" r="3.5" fill="#ec4899" />
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // VÔ TẬN TINH HÀ (STARS) - HỖN ĐỘN THÁI HƯ & BẮC ĐẨU TINH BÀN
      // -----------------------------------------------------------------------
      case "stars":
        return (
          <g className="motif-stars">
            {/* Chu Thiên Tinh Bàn 3 tầng xoay vần */}
            <g transform="translate(930, 135)">
              <g className="avatar-anim-spin-slow">
                <circle cx="0" cy="0" r="120" fill="none" stroke="rgba(168, 85, 247, 0.35)" strokeWidth="2.5" />
                <circle cx="0" cy="0" r="102" fill="none" stroke="rgba(56, 189, 248, 0.45)" strokeWidth="1.5" strokeDasharray="6 6" />
                <circle cx="0" cy="0" r="82" fill="none" stroke="rgba(254, 240, 138, 0.45)" strokeWidth="1.5" strokeDasharray="14 6" />
                {/* 12 Vạch Tinh Túc Hoàng Đạo */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="0"
                    y1="-120"
                    x2="0"
                    y2="-108"
                    stroke="rgba(192, 132, 252, 0.6)"
                    strokeWidth="2"
                    transform={`rotate(${deg})`}
                  />
                ))}
              </g>
              <g className="avatar-anim-spin-reverse">
                <polygon
                  points="0,-82 71,-41 71,41 0,82 -71,41 -71,-41"
                  fill="none"
                  stroke="rgba(254, 240, 138, 0.35)"
                  strokeWidth="1.2"
                />
                <circle cx="0" cy="0" r="55" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="0" cy="0" r="8" fill="rgba(254, 240, 138, 0.7)" />
              </g>
            </g>

            {/* Chòm sao Bắc Đẩu Thất Tinh (Big Dipper) liên kết */}
            <g opacity="0.85">
              <polyline
                points="620,80 670,60 730,75 790,65 820,110 870,105 850,150 800,140"
                fill="none"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <circle cx="620" cy="80" r="4" fill="#ffffff" className="avatar-anim-pulse" />
              <circle cx="670" cy="60" r="3.5" fill="#fef08a" className="avatar-anim-pulse" />
              <circle cx="730" cy="75" r="4.5" fill="#38bdf8" className="avatar-anim-pulse" />
              <circle cx="790" cy="65" r="3.5" fill="#ffffff" className="avatar-anim-pulse" />
              <circle cx="820" cy="110" r="4" fill="#c084fc" className="avatar-anim-pulse" />
              <circle cx="870" cy="105" r="5" fill="#fef08a" className="avatar-anim-pulse" />
              <circle cx="850" cy="150" r="4" fill="#38bdf8" className="avatar-anim-pulse" />
            </g>

            {/* Sao băng vụt sáng chéo qua bầu trời */}
            <g opacity="0.85">
              <line x1="560" y1="20" x2="690" y2="75" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" />
              <line x1="880" y1="15" x2="1020" y2="70" stroke="rgba(56, 189, 248, 0.65)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1020" y1="35" x2="1140" y2="85" stroke="rgba(254, 240, 138, 0.6)" strokeWidth="2" strokeLinecap="round" />
            </g>

            {/* Tinh vân vũ trụ lượn lờ */}
            <path
              d="M480 230 Q 640 160 820 195 Q 980 145 1150 175"
              fill="none"
              stroke="rgba(168, 85, 247, 0.22)"
              strokeWidth="18"
              strokeLinecap="round"
            />
          </g>
        );

      // -----------------------------------------------------------------------
      // VẠN KIẾM QUY TÔNG (SWORDS) - KIẾM TRẬN THẦN CUNG
      // -----------------------------------------------------------------------
      case "swords":
        return (
          <g className="motif-swords">
            {/* Kiếm Trận Bát Phương xoay vần */}
            <g transform="translate(930, 135)" className="avatar-anim-spin">
              <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="92" fill="none" stroke="rgba(186, 230, 253, 0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="0" cy="0" r="50" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
              {/* 8 Thanh Tiên Kiếm cắm chéo */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <line x1="0" y1="-128" x2="0" y2="-68" stroke="rgba(186, 230, 253, 0.65)" strokeWidth="3.5" />
                  <polygon points="0,-134 5,-122 -5,-122" fill="#38bdf8" />
                  <line x1="-8" y1="-78" x2="8" y2="-78" stroke="#bae6fd" strokeWidth="2" />
                </g>
              ))}
            </g>

            {/* Kiếm khí xé toạc bầu trời */}
            <line x1="580" y1="180" x2="880" y2="55" stroke="rgba(56, 189, 248, 0.55)" strokeWidth="2.5" strokeDasharray="10 6" />
            <line x1="720" y1="230" x2="1050" y2="85" stroke="rgba(186, 230, 253, 0.45)" strokeWidth="2" />
            <line x1="840" y1="240" x2="1140" y2="105" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="1.5" />
          </g>
        );

      // -----------------------------------------------------------------------
      // CHU THIÊN TINH ĐẤU (FORMATION) - THẦN CƠ ĐẠI TRẬN
      // -----------------------------------------------------------------------
      case "formation":
        return (
          <g className="motif-formation">
            <g transform="translate(930, 135)">
              <g className="avatar-anim-spin">
                <circle cx="0" cy="0" r="120" fill="none" stroke="rgba(192, 132, 252, 0.4)" strokeWidth="2.5" strokeDasharray="14 7" />
                <polygon points="0,-120 85,-85 120,0 85,85 0,120 -85,85 -120,0 -85,-85" fill="none" stroke="rgba(254, 240, 138, 0.35)" strokeWidth="1.5" />
              </g>
              <g className="avatar-anim-spin-reverse">
                <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(192, 132, 252, 0.45)" strokeWidth="1.5" strokeDasharray="8 4" />
                <polygon points="0,-90 78,45 -78,45" fill="none" stroke="rgba(192, 132, 252, 0.4)" strokeWidth="1.2" />
                <polygon points="0,90 78,-45 -78,-45" fill="none" stroke="rgba(254, 240, 138, 0.4)" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(254, 240, 138, 0.4)" strokeWidth="1" strokeDasharray="4 4" />
              </g>
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // THÁI CỰC ĐẠO PHỦ (YIN-YANG) - TIÊN THIÊN BÁT QUÁI
      // -----------------------------------------------------------------------
      case "yin-yang":
        return (
          <g className="motif-yin-yang">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              {/* Vòng Bát Quái Cổ Đồ */}
              <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(251, 191, 36, 0.4)" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="88" fill="none" stroke="rgba(129, 140, 248, 0.4)" strokeWidth="1.5" strokeDasharray="10 5" />
              {/* 8 Quẻ Bát Quái */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <line x1="-12" y1="-106" x2="12" y2="-106" stroke="rgba(251, 191, 36, 0.55)" strokeWidth="2.5" />
                  <line x1="-12" y1="-98" x2="12" y2="-98" stroke="rgba(251, 191, 36, 0.55)" strokeWidth="2.5" />
                </g>
              ))}
              {/* Đồ hình Thái Cực Âm Dương */}
              <path d="M0 -65 A65 65 0 0 1 0 65 A32.5 32.5 0 0 1 0 0 A32.5 32.5 0 0 0 0 -65 Z" fill="rgba(251, 191, 36, 0.35)" />
              <path d="M0 -65 A65 65 0 0 0 0 65 A32.5 32.5 0 0 0 0 0 A32.5 32.5 0 0 1 0 -65 Z" fill="rgba(99, 102, 241, 0.35)" />
              <circle cx="0" cy="-32.5" r="8" fill="rgba(99, 102, 241, 0.6)" />
              <circle cx="0" cy="32.5" r="8" fill="rgba(251, 191, 36, 0.6)" />
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // HỖN ĐỘN LIÊN ĐÀI (LOTUS) - TỊNH THẾ TIÊN TRÌ
      // -----------------------------------------------------------------------
      case "lotus":
        return (
          <g className="motif-lotus">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(251, 113, 133, 0.35)" strokeWidth="2" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <path
                  key={deg}
                  d="M0 -115 C 30 -60, 0 0, 0 0 C 0 0, -30 -60, 0 -115"
                  fill="rgba(251, 113, 133, 0.2)"
                  transform={`rotate(${deg})`}
                />
              ))}
              <circle cx="0" cy="0" r="30" fill="rgba(253, 164, 175, 0.3)" />
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // TAM MUỘI HỎA PHỦ (FIRE) - LIỆT DIỄM ĐỘNG THIÊN
      // -----------------------------------------------------------------------
      case "fire":
        return (
          <g className="motif-fire">
            {/* Vòng Liệt Diễm Luân 16 tia lửa */}
            <g transform="translate(930, 135)" className="avatar-anim-spin">
              <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(249, 115, 22, 0.4)" strokeWidth="3" />
              <circle cx="0" cy="0" r="92" fill="none" stroke="rgba(254, 240, 138, 0.5)" strokeWidth="1.5" strokeDasharray="6 4" />
              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map((deg) => (
                <path
                  key={deg}
                  d="M0 -124 Q 10 -95 0 -72"
                  fill="none"
                  stroke="rgba(249, 115, 22, 0.55)"
                  strokeWidth="2.5"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
            {/* Làn sóng hỏa diễm bốc cao */}
            <path
              d="M480 240 Q 640 170 820 205 Q 980 150 1160 185 L 1200 190 L 1200 280 L 480 280 Z"
              fill="rgba(249, 115, 22, 0.28)"
            />
            {/* Tàn tro linh hỏa bay lên */}
            <circle cx="780" cy="80" r="4.5" fill="#fef08a" className="avatar-anim-pulse" opacity="0.85" />
            <circle cx="890" cy="50" r="3.5" fill="#f97316" className="avatar-anim-pulse" opacity="0.8" />
            <circle cx="1010" cy="85" r="4" fill="#fef08a" className="avatar-anim-pulse" opacity="0.8" />
            <circle cx="1090" cy="125" r="3" fill="#ef4444" opacity="0.75" />
          </g>
        );

      // -----------------------------------------------------------------------
      // HÀN BĂNG THẦN CUNG (ICE) - VẠN NIÊN PHÁCH ĐIỆN
      // -----------------------------------------------------------------------
      case "ice":
        return (
          <g className="motif-ice">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2.5" />
              {[0, 60, 120, 180, 240, 300].map((deg) => (
                <g key={deg} transform={`rotate(${deg})`}>
                  <line x1="0" y1="-120" x2="0" y2="0" stroke="rgba(186, 230, 253, 0.55)" strokeWidth="2.5" />
                  <line x1="-15" y1="-85" x2="15" y2="-85" stroke="rgba(186, 230, 253, 0.55)" strokeWidth="2" />
                  <line x1="-10" y1="-50" x2="10" y2="-50" stroke="rgba(186, 230, 253, 0.55)" strokeWidth="2" />
                </g>
              ))}
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // THỦY NGUYỆT TIÊN ĐẦM (WATER)
      // -----------------------------------------------------------------------
      case "water":
        return (
          <g className="motif-water">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(14, 165, 233, 0.4)" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(125, 211, 252, 0.45)" strokeWidth="1.5" strokeDasharray="8 6" />
              <path d="M-60 0 A60 60 0 0 0 60 0 A60 45 0 0 1 -60 0 Z" fill="rgba(125, 211, 252, 0.35)" />
            </g>
            <path d="M420 250 Q 600 215 780 240 Q 960 205 1140 230 L 1200 235 L 1200 280 L 420 280 Z" fill="rgba(14, 165, 233, 0.25)" />
          </g>
        );

      // -----------------------------------------------------------------------
      // CỬU TIÊU PHONG VỰC (WIND)
      // -----------------------------------------------------------------------
      case "wind":
        return (
          <g className="motif-wind">
            <g transform="translate(930, 135)" className="avatar-anim-spin">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(52, 211, 153, 0.35)" strokeWidth="2.5" />
              {[0, 72, 144, 216, 288].map((deg) => (
                <path
                  key={deg}
                  d="M0 -115 Q 40 -80 0 -40"
                  fill="none"
                  stroke="rgba(45, 212, 191, 0.55)"
                  strokeWidth="3"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // TỬ TIÊU LÔI ĐIỆN (THUNDER)
      // -----------------------------------------------------------------------
      case "thunder":
        return (
          <g className="motif-thunder">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="88" fill="none" stroke="rgba(254, 240, 138, 0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
            </g>
            {/* Lôi kiếp chớp lóe */}
            <g className="avatar-anim-flash" opacity="0.85">
              <path d="M720 30 L760 90 L740 115 L790 175" fill="none" stroke="#fef08a" strokeWidth="3" />
              <path d="M960 20 L1000 85 L980 110 L1025 170" fill="none" stroke="#c084fc" strokeWidth="3" />
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // CỬU U MA PHỦ (SHADOW)
      // -----------------------------------------------------------------------
      case "shadow":
        return (
          <g className="motif-shadow">
            <g transform="translate(930, 135)" className="avatar-anim-spin-reverse">
              <circle cx="0" cy="0" r="118" fill="none" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="3" />
              <circle cx="0" cy="0" r="85" fill="none" stroke="rgba(244, 63, 94, 0.45)" strokeWidth="2" strokeDasharray="12 6" />
              <circle cx="0" cy="0" r="50" fill="rgba(147, 51, 234, 0.35)" />
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // THÁI DƯƠNG THÁNH ĐIỆN (LIGHT)
      // -----------------------------------------------------------------------
      case "light":
        return (
          <g className="motif-light">
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="120" fill="none" stroke="rgba(250, 204, 21, 0.45)" strokeWidth="3" />
              <circle cx="0" cy="0" r="95" fill="none" stroke="rgba(254, 240, 138, 0.55)" strokeWidth="1.5" strokeDasharray="4 4" />
              {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
                <line
                  key={deg}
                  x1="0"
                  y1="-132"
                  x2="0"
                  y2="-112"
                  stroke="rgba(254, 240, 138, 0.6)"
                  strokeWidth="2"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
          </g>
        );

      // -----------------------------------------------------------------------
      // TIÊN ĐẾ CHÍ TÔN (CELESTIAL EMPEROR / REALM-14)
      // -----------------------------------------------------------------------
      case "celestial-emperor":
        return (
          <g className="motif-celestial-emperor">
            {/* Vô Thượng Tiên Triều Kim Luân 3 tầng cực hạn */}
            <g transform="translate(930, 135)">
              <g className="avatar-anim-spin-slow">
                <circle cx="0" cy="0" r="124" fill="none" stroke="rgba(255, 215, 0, 0.45)" strokeWidth="3.5" />
                <circle cx="0" cy="0" r="105" fill="none" stroke="rgba(254, 240, 138, 0.6)" strokeWidth="2" strokeDasharray="8 6" />
                {/* 24 Kim Tiên Thần Thương */}
                {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
                  <polygon
                    key={deg}
                    points="0,-140 6,-115 -6,-115"
                    fill="rgba(255, 215, 0, 0.55)"
                    transform={`rotate(${deg})`}
                  />
                ))}
              </g>
              <g className="avatar-anim-spin-reverse">
                <polygon
                  points="0,-85 73,-43 73,43 0,85 -73,43 -73,-43"
                  fill="none"
                  stroke="rgba(255, 215, 0, 0.5)"
                  strokeWidth="1.8"
                />
                <circle cx="0" cy="0" r="55" fill="none" stroke="rgba(254, 240, 138, 0.55)" strokeWidth="1.5" strokeDasharray="4 4" />
                <circle cx="0" cy="0" r="12" fill="rgba(255, 215, 0, 0.85)" />
              </g>
            </g>

            {/* Cửu Trùng Thiên Mây Vàng (Cửu Tiêu Tường Vân) */}
            <path
              d="M380 235 Q 520 185 680 215 Q 860 160 1040 195 Q 1140 170 1200 185 L 1200 280 L 380 280 Z"
              fill="rgba(245, 158, 11, 0.28)"
            />

            {/* Kim quang vạn trượng nhấp nháy */}
            <circle cx="820" cy="65" r="5" fill="#ffffff" className="avatar-anim-pulse" opacity="0.9" />
            <circle cx="960" cy="45" r="4" fill="#fde047" className="avatar-anim-pulse" opacity="0.85" />
            <circle cx="1080" cy="85" r="5" fill="#fef08a" className="avatar-anim-pulse" opacity="0.9" />
          </g>
        );

      // -----------------------------------------------------------------------
      // CULTIVATION / DEFAULT FALLBACK MOTIF
      // -----------------------------------------------------------------------
      default:
        return (
          <g className="motif-default">
            {/* Vòng Bát Quái Cổ Trận */}
            <g transform="translate(930, 135)" className="avatar-anim-spin-slow">
              <circle cx="0" cy="0" r="115" fill="none" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="2.5" />
              <circle cx="0" cy="0" r="92" fill="none" stroke="rgba(255, 255, 255, 0.35)" strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="0" cy="0" r="68" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" strokeDasharray="12 6" />
            </g>
            {/* Dãy núi tiên sơn mờ sương */}
            <path
              d="M420 240 Q580 185 740 215 Q900 165 1060 195 Q1150 170 1200 185 L1200 280 L420 280 Z"
              fill="rgba(255, 255, 255, 0.16)"
            />
          </g>
        );
    }
  };

  return (
    <div
      className={`public-profile-cover profile-cover-themed profile-cover--${theme.id}`}
      aria-hidden="true"
    >
      {/* SVG Artistic Layer */}
      <svg
        className="profile-cover-svg"
        viewBox="0 0 1200 280"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Shared Xianxia Mountain Mist & Vân Hải */}
        <g className="profile-cover-backdrop-nature" opacity="0.55">
          {/* Layer 1: Far misty peaks */}
          <path
            d="M320 280 L420 180 L530 225 L650 155 L780 215 L910 145 L1030 195 L1130 135 L1200 170 L1200 280 Z"
            fill="currentColor"
            opacity="0.14"
          />
          {/* Layer 2: Near peaks */}
          <path
            d="M450 280 L560 215 L680 245 L800 190 L940 235 L1060 180 L1200 220 L1200 280 Z"
            fill="currentColor"
            opacity="0.2"
          />
          {/* Layer 3: Flowing cloud river (Vân Hải) */}
          <path
            d="M260 260 Q380 220 520 240 Q660 200 800 230 Q940 190 1080 220 Q1160 205 1200 215 L1200 280 L260 280 Z"
            fill="currentColor"
            opacity="0.25"
          />
        </g>

        {/* Traditional Xianxia Corner Filigree Flourish (Top Right) */}
        <g transform="translate(1160, 20) scale(0.65)" opacity="0.4" stroke="currentColor" fill="none" strokeWidth="1.5">
          <path d="M-60 0 C-40 0, -20 -5, 0 -20 C -5 -40, 0 -60, 0 -60" />
          <path d="M-45 0 C-30 0, -15 -3, 0 -15 C -3 -30, 0 -45, 0 -45" />
          <circle cx="-12" cy="-12" r="3" fill="currentColor" />
          <line x1="-30" y1="0" x2="0" y2="0" strokeWidth="2" />
          <line x1="0" y1="-30" x2="0" y2="0" strokeWidth="2" />
        </g>

        {/* Themed Specific Motif Layer */}
        {renderMotif()}
      </svg>

      {/* Dynamic Thematic Pill Badge (Top Left) */}
      <span className="profile-cover-badge">
        {theme.caveName} <i>·</i> {theme.badgeText}
      </span>

      {/* Dynamic Thematic Calligraphy (Bottom Right) */}
      <b className="profile-cover-calligraphy">
        {theme.poeticLine}
      </b>
    </div>
  );
}
