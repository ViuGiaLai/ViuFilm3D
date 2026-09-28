# Tài nguyên viền avatar

Danh mục chuẩn: `lib/avatar-frames.ts` (37 viền trong 5 bộ sưu tập, thêm lựa chọn không viền).
Ánh xạ ảnh: `lib/avatar-frame-media.ts`. Hồ sơ lưu mã viền ổn định, không lưu đường dẫn ảnh.

Mỗi bộ tài nguyên có phiên bản: `public/assets/avatar-frames/<collection>/<frame-id>/vN/`.
Thư mục chứa `animated.webp` và `poster.webp` (ảnh tĩnh cho chế độ giảm chuyển động).
Bản gốc nằm trong `assets/avatar-frames/sources/<frame-id>/vN/original.webp`, không phục vụ qua web.

Mã bộ sưu tập: realms (Cảnh giới), elements (Nguyên tố), beasts (Linh thú), achievements (Đạo hạnh), special (Đặc biệt).
Các viền chưa có ảnh riêng vẫn dùng SVG hiện có; không giả lập rằng đã có 37 ảnh WebP.

Thay viền: tạo thư mục v2, xử lý ảnh về kích thước hợp lý, cập nhật src/poster/version/scale tại ánh xạ, giữ nguyên frame-id.
Scale xác định kích thước hình viền so với avatar để vùng trong suốt không che mặt.
Tiên Đế (realm-14) v1 dùng file dragon_fire_roar_ready_to_use.webp người dùng cung cấp.
Tạo lại: `node scripts/prepare-frame-media.mjs "D:/Downloads/dragon_fire_roar_ready_to_use.webp"`.
