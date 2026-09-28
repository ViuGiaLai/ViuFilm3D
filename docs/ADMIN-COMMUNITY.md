# Quản trị cộng đồng

- `/admin/vien-trang-tri`: xem 37 viền, chọn đạo hữu để cấp/thu hồi quyền dùng riêng, thay avatar có sẵn/ảnh đã tải lên, đạo danh, giới thiệu và cảnh giới.
- `/admin/nguoi-dung`: avatar và viền thật; mở chỉnh sửa tài khoản rồi chọn hỗ trợ avatar/viền/cảnh giới.
- Admin sở hữu mọi viền không cần XP; migration đưa admin hiện có lên Tiên Đế Viên Mãn. Hồ sơ admin mới khởi tạo tại 11900 đạo hạnh.
- `/admin/the-gioi`: tìm kiếm, phân trang, ẩn/khôi phục lời luận đạo với lý do. Broadcast báo các client cập nhật.
- `/admin/nhat-ky`: xem 50 thao tác hỗ trợ gần nhất, dữ liệu trước/sau và người thực hiện.
- Không cung cấp trang đọc/kiểm duyệt mật thư 1–1 hay danh sách bằng hữu cá nhân cho admin.
- API hỗ trợ không thay email, mật khẩu hay vai trò. Kiểm tra điều kiện viền tại server; ghi hồ sơ và nhật ký trong cùng giao dịch; kiểm tra phiên bản hồ sơ để tránh ghi đè chỉnh sửa đồng thời.
- Tài nguyên ảnh được tách khỏi danh mục/mã viền: xem `assets/avatar-frames/README.md`. Thay ảnh bằng phiên bản mới, không đổi mã viền đã lưu trong hồ sơ.

Kiểm tra: `npx tsx scripts/check-community.ts --live` (chỉ đọc và kiểm tra từ chối quyền), `npm run admin:check`, `npm run typecheck`, `npm run build`.
