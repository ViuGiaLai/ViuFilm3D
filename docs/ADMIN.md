# Quản trị ViuFilm3D

## Chức năng đang có

| Khu vực        | Admin làm được                                                                               | Giới hạn an toàn                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Tổng quan      | Tổng phim, lượt xem ghi nhận, điểm nội dung, tài khoản, lịch tuần, xếp hạng                  | Không phải thống kê người đang online; điểm phim là dữ liệu biên tập                                          |
| Kho phim       | Thêm, sửa, nhân bản, xóa, lọc, sắp xếp, chọn nhiều, quản lý tập và media                     | Sửa phim không ghi đè lượt xem thật; phim mới bắt đầu từ 0                                                    |
| Lịch phát hành | Quản lý tiến độ, ngày cập nhật, trạng thái phim                                              | Admin phải kiểm tra nguồn phát trước khi công bố                                                              |
| Người dùng     | Tìm tên/email, lọc, phân trang, đổi tên, khóa/mở, đổi nhãn gói, xem tu vi và hồ sơ công khai | Không đổi email/vai trò, không khóa/xóa admin; không sửa tu vi, lượt xem, ngày đăng ký                        |
| Bình luận      | Tìm nội dung toàn hệ thống, lọc hiện/ẩn, 50 mục/trang, làm mới, ẩn/khôi phục/xóa             | Yêu cầu phiên admin tại API; ưu tiên ẩn thay vì xóa vĩnh viễn; kiểm duyệt gửi sự kiện realtime cho trang phim |
| Cài đặt        | Lưu cấu hình hệ thống, bật/tắt đăng ký, thông báo bảo trì, số phim/trang                     | Thông báo bảo trì không phải khóa toàn website; VIP hiện chỉ là nhãn, không có thanh toán/quyền trả phí       |

## Vận hành

- Người xem tự đăng ký qua Supabase Auth. Admin không tạo mật khẩu dùng chung hoặc xem mật khẩu người xem.
- Khóa hồ sơ được kiểm tra lại tại các API cần danh tính người xem, không chỉ ẩn nút trên giao diện.
- Xóa tài khoản thật xóa danh tính Auth và dữ liệu hồ sơ liên quan theo ràng buộc database. Hộp xác nhận nhắc mức độ ảnh hưởng; không dùng để xử lý vi phạm tạm thời.
- Production không dùng tài khoản mẫu làm thống kê khi tải dữ liệu thất bại.
- Dữ liệu riêng như email chỉ có trong API admin, hồ sơ công khai dùng UUID.
- Cảnh giới/viền là trang trí. Admin chưa có công cụ cấp thưởng hoặc sửa điểm thủ công để tránh phá sổ tích lũy.

## Chưa triển khai

Chưa có phân quyền nhiều cấp, nhật ký thao tác admin bền vững, hàng đợi báo cáo vi phạm, quản trị tin nhắn riêng, thanh toán VIP hoặc bảng phân tích thời gian xem theo ngày. Không nên đọc tin nhắn riêng hoặc tự cấp huy hiệu xác minh chỉ vì có quyền quản lý phim. Các chức năng này cần thiết kế quyền riêng tư và schema riêng trước khi mở cho admin.

## Kiểm tra

`npm run typecheck`, `npm run build`, `npm run admin:check`. Script admin kiểm tra từ chối truy cập không đăng nhập, chỉ gửi yêu cầu không được phép; không xóa/sửa dữ liệu thật. Kiểm tra lưu/khóa/kiểm duyệt bằng tài khoản admin nên dùng dữ liệu thử nghiệm riêng.
