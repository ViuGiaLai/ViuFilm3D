# Cảnh giới và viền ViuFilm3D

Hệ thống trang trí riêng của trang, không phải thứ tự chuẩn của mọi tác phẩm tiên hiệp. Không tự cấp VIP, xác minh, trạng thái online, tông môn hay quyền quản trị.

## Điểm và chống tính trùng

- Bình luận hợp lệ đầu tiên mỗi phim mỗi ngày UTC: 10 đạo hạnh. Bình luận/phản hồi thêm cùng phim trong ngày không tăng điểm.
- Phim từ 120 giây, tiến độ lưu ít nhất 50%, vị trí hợp lệ và khớp tỷ lệ tiến độ: 20 đạo hạnh một lần cho mỗi phim, không tính lại khi đổi tập/tải lại.
- Trigger và sổ `cultivation_awards` đảm bảo cộng điểm nguyên tử, chống trùng khi có nhiều request đồng thời. Điểm đã trao không bị trừ khi xóa bình luận; xóa rồi đăng lại không tăng điểm cùng mốc.
- Tiến độ xem được báo từ client nên chưa phải bằng chứng xem chống gian lận. Đây chỉ là điểm trang trí, không được dùng cho tiền/thưởng có giá trị, xếp hạng cạnh tranh hoặc phân quyền. Muốn những tính năng đó cần heartbeat playback và xác minh thời gian xem phía server.
- Không có nút tự nhập điểm/cảnh giới. Viền được kiểm tra theo điểm server khi lưu hồ sơ.

## Lộ trình

Phàm Nhân → Luyện Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Huyền Kiếp → Dương Thực → Phi Thăng → Chân Tiên → Tiên Đế.

Mỗi cảnh giới có Sơ Kỳ, Trung Kỳ, Hậu Kỳ, Viên Mãn. Ngưỡng và diễn giải nằm trong `lib/cultivation.ts`, mỗi cảnh giới mở một viền tương ứng. Huyền Kiếp Trung Kỳ bắt đầu ở 3.900 điểm; Dương Thực Hậu Kỳ ở 5.600 điểm. Đây là các mốc của ViuFilm3D, không mô tả sức mạnh nhân vật của mọi phim.

## Bộ sưu tập

37 viền + lựa chọn không viền, chia thành 5 nhóm: cảnh giới, 7 nguyên tố, 6 linh thú, 4 mốc đạo hạnh và 5 đặc biệt. Catalog và điều kiện mở khóa nằm trong `lib/avatar-frames.ts`. SVG nhẹ, không GIF/video/particle hoặc vòng lặp animation trên từng avatar. Không tải tài nguyên của trang tham khảo.

Viền linh thú hiện là khung biểu tượng cách điệu, không phải ảnh thú 3D chuyển động. Viền sự kiện/VIP/Top 1/100 phim không tự thêm vì chưa có nguồn dữ liệu tương ứng.

Trang tài khoản có nút bật/tắt chuyển động, lưu lựa chọn trên thiết bị. Hào quang và vòng phù văn của avatar chính tự dừng khi tab ẩn và tôn trọng chế độ giảm chuyển động. Chỉ phần phù văn quay; ảnh chân dung và huy hiệu giữ đúng chiều. Các thumbnail trong bộ sưu tập không chạy animation liên tục.

## URL và hồ sơ

- Hồ sơ dùng UUID công khai thay ID tăng dần: `/nguoi-dung/<public_id>`; URL số cũ bị từ chối. Không thể ẩn hoàn toàn URL trên trình duyệt. UUID không thay thế kiểm tra quyền ở API.
- Phim dùng slug có sẵn của bản ghi. Link số cũ của phim/player được đổi sang slug sau khi catalog tải thành công, giữ query tập/trailer.
- Bấm tên/avatar bình luận mở thẻ xem nhanh; chỉ bấm nút trang cá nhân mới đổi URL. Không công khai email, khóa hay token trong thẻ.

## Database

Sau migration social profiles, chạy `supabase/migrations/20260929010000_cultivation_and_public_profiles.sql` trong Supabase SQL Editor rồi `npm run backend:check`. Migration cấp UUID cho tài khoản cũ, backfill điểm từ hoạt động đang có, không xóa dữ liệu người dùng. Có thể chạy lại mà không cộng trùng.

## Kiểm tra

- `npm run cultivation:check`: ngưỡng cảnh giới, tiến độ, mở khóa, kiểm tra loại/kích thước ảnh và nhận diện ảnh riêng đã tải.
- `npm run backend:check`: schema, cấu hình và quan hệ foreign key tác giả bình luận.
- `npm run profile:check`: kiểm tra chỉ đọc qua API của app đang chạy tại cổng 3000 (đổi bằng `PROFILE_SMOKE_BASE_URL` nếu cần). Kiểm tra hồ sơ UUID, từ chối URL số, không trả trường riêng tư, slug phim và dữ liệu tác giả bình luận. Không tạo tài khoản/bình luận hoặc thay đổi dữ liệu thật. Kiểm tra này không thay thế QA giao diện, đăng nhập/lưu hồ sơ thực tế hoặc đo hiệu năng trình duyệt.
