# Đạo Hữu Các

## Tên gọi

- Bạn bè → Bằng hữu; kết bạn → Kết giao.
- Người tham gia cộng đồng → Đạo hữu; tên trong cộng đồng → Đạo danh.
- Tin nhắn riêng → Mật thư / Truyền mật thư.
- Chat toàn server → Thế Giới — Luận Đạo.
- Trang hồ sơ → Động phủ trong khu vực giao lưu. Các mục bảo mật như email, mật khẩu vẫn dùng từ rõ nghĩa, không đổi thành thuật ngữ khó hiểu.

## Đồng bộ và bố cục

Khung chat dùng portal tại body, vùng cuộn riêng, không gọi scrollIntoView kéo trang. Chỉ theo tin mới khi đang ở cuối; xem thư cũ giữ vị trí. Bàn phím mobile thay đổi visualViewport sẽ cập nhật chiều cao khung. Nội dung dài tự xuống dòng; đầu khung, thanh nhập và chân khung không bị flex co mất. Có Escape, focus trap, khôi phục focus và giảm chuyển động theo hệ điều hành.

Một scheduler nhận tín hiệu realtime và kiểm tra dự phòng 20 giây khi tab đang hiển thị. Các thành phần dùng chung topic chia sẻ subscription, tránh tạo kênh trùng. Broadcast chỉ chứa tín hiệu thay đổi, không chứa mật thư; API có xác thực cung cấp nội dung. Phản hồi cuộc trò chuyện cũ không được ghi vào phòng mới.

## Dữ liệu và quyền

Áp dụng `supabase/migrations/20260929020000_world_chat.sql` sau các migration hồ sơ.

- Mật thư chỉ dành cho hai bằng hữu đã chấp nhận kết giao. Xem trang chat chỉ đánh dấu các tin thực sự được tải là đã đọc.
- Luận đạo chung cần đăng nhập; mọi đạo hữu đăng nhập đều đọc được, không phải kênh riêng tư.
- Bảng world_messages bật RLS, thu hồi quyền đọc/ghi trực tiếp của anon/authenticated. API dùng danh tính đã kiểm tra, không tin sender_id từ client.
- RPC gửi luận đạo khóa hàng tài khoản để hạn chế gửi đồng thời vượt cooldown hai giây. Nội dung 1–1000 ký tự; React hiển thị dưới dạng text, không HTML.
- World feed có status để ẩn vi phạm nhưng chưa có giao diện kiểm duyệt kênh chung riêng. Không tự suy diễn VIP hoặc online.

## Kiểm thử

`npm run chat:check` kiểm tra ghép tin, thứ tự, chống trùng và điều kiện giữ cuộn.

`npm run chat:check -- --live` tạo đúng hai tài khoản tạm có email random, đăng nhập qua API thật, kết giao, gửi nhận mật thư, kiểm tra chưa đọc/đã đọc, cursor, quyền truy cập và realtime. Nếu migration đã có, kiểm tra luận đạo chung và không lộ email. Cuối cùng xóa đúng hồ sơ/Auth được tạo trong lần chạy; tin và liên kết kiểm thử được cascade xóa. Không dùng tài khoản thật của người xem. Chỉ chạy live khi có yêu cầu kiểm thử cho phép tạo dữ liệu tạm.

Thiết lập `CHAT_SMOKE_BASE_URL` nếu server không dùng localhost:3000. Script không in mật khẩu/cookie/key. Nếu cleanup thất bại, báo UUID fixture để quản trị xử lý; không xóa rộng theo mẫu email.
