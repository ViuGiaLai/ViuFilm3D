# Backend và Supabase

Frontend chỉ làm việc với các gateway dữ liệu (`movieGateway`, `adminGateway`, `authGateway`). Nguồn dữ liệu được chọn bằng một biến môi trường:

```ini
NEXT_PUBLIC_API_MODE=mock
```

- `mock`: đọc và ghi phim, người dùng và cấu hình mẫu trong `localStorage`.
- `production`: gọi REST API `/api/v1`; API kết nối tới Supabase.

Đổi mode cần khởi động lại `npm run dev`. Khi deploy, cần build lại vì biến `NEXT_PUBLIC_*` được Next.js đóng vào bundle lúc build.

## 1. Cấu hình local

Tạo `.env.local`:

```ini
NEXT_PUBLIC_API_MODE=mock
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SECRET_KEY=sb_secret_your_server_key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-strong-password
AUTH_SECRET=replace-with-at-least-32-random-characters
```

`SUPABASE_SECRET_KEY` chỉ tồn tại ở server. Không thêm tiền tố `NEXT_PUBLIC_` và không commit khóa này lên Git.

`ADMIN_PASSWORD`, `AUTH_SECRET` và `SUPABASE_SECRET_KEY` đều là bí mật phía server. Backend tạo cookie `HttpOnly`, `SameSite=Lax` đã ký sau khi admin đăng nhập. API ghi phim, quản lý người dùng và cập nhật cấu hình đều từ chối yêu cầu không có phiên admin hợp lệ. Khi tải lại trang, frontend kiểm tra lại phiên qua `/api/v1/auth/session` thay vì tin dữ liệu tài khoản trong `localStorage`.

Phiên production có hai loại: quản trị dùng mật khẩu máy chủ; người xem đăng ký và đăng nhập qua **Supabase Auth**. Mật khẩu người xem không nằm trong `app_users`; bảng này chỉ lưu hồ sơ và trạng thái khóa. Phiên người xem dùng cookie `HttpOnly`; backend xác thực token với Supabase trước khi đọc/ghi bình luận hoặc thư viện cá nhân. Chế độ mock vẫn có tài khoản mẫu, bình luận mẫu trong `localStorage` và không tạo tài khoản Supabase thật.

Mật khẩu Postgres không được dùng bởi `supabase-js` trong kiến trúc hiện tại.

## 2. Tạo bảng

Mở **Supabase Dashboard → SQL Editor**, chạy lần lượt:

```text
supabase/migrations/20260926000000_create_movies.sql
supabase/migrations/20260926001000_create_admin.sql
supabase/migrations/20260926002000_add_movie_media.sql
supabase/migrations/20260926003000_add_movie_episodes.sql
supabase/migrations/20260926004000_add_movie_trailer.sql
supabase/migrations/20260927000000_add_movie_view_counter.sql
supabase/migrations/20260928000000_viewer_accounts_and_comments.sql
supabase/migrations/20260929000000_social_profiles.sql
supabase/migrations/20260929010000_cultivation_and_public_profiles.sql
```

Migration tạo các bảng `movies`, `app_users`, `site_settings`, index, ràng buộc dữ liệu, trigger `updated_at` và Row Level Security:

- `movies`: công khai chỉ được đọc; ghi qua backend.
- `site_settings`: công khai chỉ được đọc; ghi qua backend.
- `app_users`: không công khai; chỉ backend dùng secret key được truy cập.
- `cultivation_awards`: sổ điểm đạo hạnh duy nhất theo người dùng/nguồn/mốc, không cho trình duyệt ghi trực tiếp. Cần chạy migration cảnh giới trước khi chạy phiên bản frontend/backend này; thiếu cột mới sẽ làm các API tài khoản báo lỗi readiness.
- `movie_view_events`: ghi nhận lượt xem đủ điều kiện, tránh tính trùng trong thời gian ngắn; backend cập nhật `movies.views` bằng hàm `record_movie_view`.
- `movie_comments`: bình luận công khai, chỉ chủ bình luận hoặc quản trị được xóa; giới hạn 1000 ký tự và tần suất gửi.
- `viewer_favorites`, `viewer_history`: danh sách yêu thích và lịch sử xem gắn với tài khoản để dùng trên nhiều thiết bị.
- `app_users.avatar_id`, `app_users.avatar_updated_at`, `app_users.bio`: avatar mẫu/ảnh tải lên và giới thiệu công khai; không lộ email trên hồ sơ người khác.
- `friend_links`: lời mời và quan hệ bạn bè có xác nhận hai chiều.
- `user_follows`: theo dõi hồ sơ một chiều, độc lập với việc kết bạn.
- `direct_messages`: tin nhắn riêng, chỉ API cho hai tài khoản đã kết bạn đọc/ghi; không có truy cập trực tiếp từ trình duyệt tới bảng.
- `movie_comment_likes` và `movie_comments.parent_id`: thích, phản hồi bình luận; bộ đếm thích cập nhật bằng trigger trong database để không lệch sau khi tải lại.

Sau migration, bật **Authentication → Providers → Email** trong Supabase. Nếu bật xác nhận email, người xem phải mở thư xác nhận trước khi đăng nhập. Cấu hình Site URL của Supabase trỏ về địa chỉ ứng dụng đang sử dụng. Chạy `npm run backend:check` để xác nhận các bảng đã xuất hiện trước khi sử dụng production.

## 3. Nạp dữ liệu mẫu lên Supabase

Sau khi thêm `SUPABASE_SECRET_KEY` vào `.env.local`:

```bash
npm run db:seed
```

Lệnh nạp phim mẫu, tài khoản mẫu và cấu hình mặc định. Có thể chạy lại nhiều lần vì dùng `upsert` theo `id`.

## 4. API hiện có

- `GET /api/v1/movies`: danh sách phim công khai.
- `GET /api/v1/movies/:id`: chi tiết phim công khai.
- `PUT/DELETE /api/v1/movies/:id`: quản trị phim.
- `DELETE /api/v1/movies`: xóa nhiều phim.
- `GET /api/v1/users`: danh sách tài khoản cho quản trị.
- `PUT/DELETE /api/v1/users/:id`: quản trị tài khoản.
- `GET /api/v1/settings`: cấu hình hiển thị công khai.
- `PUT /api/v1/settings`: cập nhật cấu hình.
- `POST /api/v1/auth/register`: đăng ký người xem khi `allow_registration` bật.
- `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/session`: phiên quản trị và người xem.
- `GET/POST /api/v1/movies/:id/comments`, `DELETE /api/v1/comments/:id`: đọc, viết và xóa bình luận.
- `GET /api/v1/admin/comments`, `PATCH /api/v1/comments/:id`: quản trị xem, ẩn/hiện bình luận. Trang quản trị có mục **Bình luận**.
- `GET /api/v1/me/library`, `PUT/DELETE /api/v1/me/favorites/:movieId`, `POST/DELETE /api/v1/me/history`, `PATCH /api/v1/me/profile`: dữ liệu người xem đã đăng nhập.
- `GET /api/v1/users/:id/profile`: hồ sơ công khai và bình luận gần đây, không trả email.
- `POST /api/v1/me/avatar`, `GET /api/v1/avatars/:id`: tải ảnh JPEG/PNG/WebP tối đa 2 MB lên R2 và hiển thị qua backend. Mỗi tài khoản dùng một key R2 cố định `avatars/:id/current`, tải ảnh mới ghi đè ảnh cũ.
- `GET /api/v1/community/users`, `POST /api/v1/users/:id/friend`: tìm người dùng và gửi lời mời.
- `PUT/DELETE /api/v1/users/:id/follow`: theo dõi hoặc bỏ theo dõi hồ sơ.
- `GET /api/v1/me/social`, `PATCH/DELETE /api/v1/me/friends/:id`: danh sách bạn bè, nhận hoặc hủy lời mời.
- `GET/POST /api/v1/me/messages/:userId`: đọc và gửi tối đa 50 tin nhắn gần nhất với bạn bè đã chấp nhận.
- `PUT/DELETE /api/v1/comments/:id/like`: thích hoặc bỏ thích bình luận bằng phiên tài khoản.

### Cập nhật trực tiếp

- Bình luận và tin nhắn vẫn được đọc từ API để áp dụng quyền truy cập và trả dữ liệu đầy đủ. Sau khi lưu thay đổi, backend gửi một tín hiệu không chứa nội dung qua Supabase Realtime Broadcast; trình duyệt nhận tín hiệu rồi tải lại dữ liệu cần thiết, không tải lại cả trang.
- Kênh bình luận chỉ chứa mã phim. Kênh thông báo cá nhân dùng tên chủ đề khó đoán tạo bằng HMAC trên máy chủ; nội dung tin nhắn riêng không bao giờ được phát qua Broadcast. Khóa `SUPABASE_SECRET_KEY` chỉ ở server, trình duyệt chỉ dùng `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Khi WebSocket không kết nối hoặc bị gián đoạn, bình luận tự đồng bộ sau tối đa khoảng 45 giây khi tab đang hiển thị; tin nhắn đang mở và thông báo có cơ chế kiểm tra định kỳ. Realtime Inspector trong Supabase là công cụ kiểm tra kết nối, không phải nơi lưu bình luận.
- `GET /api/v1/status`: trạng thái kết nối API và database, không trả về bí mật.
- `/api/v1/media/*`: upload, xác nhận, đọc, liệt kê và xóa media trên R2.

## 5. Chuyển sang backend thật

```ini
NEXT_PUBLIC_API_MODE=production
```

Sau đó khởi động lại:

```bash
npm run dev
```

## 6. Biến môi trường trên Render

Thêm các biến sau trong **Render → Environment**:

- `NEXT_PUBLIC_API_MODE=production`
- `NEXT_PUBLIC_API_BASE_URL=`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `AUTH_SECRET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_BUCKET`

Không đưa mật khẩu database hoặc secret key vào GitHub workflow, Dockerfile hay mã nguồn.

Hướng dẫn R2 và CORS: [R2.md](R2.md).

Với GitHub Actions, thêm hai secret dùng trong bước build Docker vì biến `NEXT_PUBLIC_*` được đóng vào frontend khi build:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD` và `AUTH_SECRET` chỉ cấu hình tại môi trường chạy trên Render, không truyền thành Docker build argument.

## 7. Docker production

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_MODE=production \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key \
  -t viufilm3d:production .

docker run --rm -p 10000:10000 \
  -e NEXT_PUBLIC_API_MODE=production \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key \
  -e SUPABASE_SECRET_KEY=sb_secret_your_server_key \
  -e ADMIN_EMAIL=admin@example.com \
  -e ADMIN_PASSWORD=replace-with-a-strong-password \
  -e AUTH_SECRET=replace-with-at-least-32-random-characters \
  viufilm3d:production
```

Các giá trị trong ví dụ là placeholder. Không đưa khóa thật vào lịch sử terminal dùng chung hoặc commit Git.

## 8. Readiness và health check

- `GET /api/health` là health check dùng cho Render. Ở production, endpoint chỉ trả `200` khi bảng phim, bộ đếm lượt xem, hồ sơ người xem, bình luận, thư viện cá nhân, bạn bè và tin nhắn truy cập được, đồng thời cấu hình đăng nhập admin và R2 đầy đủ. Nếu thiếu, endpoint trả `503` với `status=degraded`; xem `viewCounter`, `viewerFeatures` hoặc `socialFeatures` để biết migration nào còn thiếu.
- `GET /api/v1/status` trả trạng thái chi tiết nhưng không trả giá trị secret: `database`, `databaseAdmin`, `adminAuth`, `objectStorage` và `ready`.

Nếu `database=unavailable` nhưng URL/key Supabase đã đúng, kiểm tra đã chạy đủ ba migration hay chưa. Nếu `databaseAdmin=not_configured` hoặc `adminAuth=not_configured`, bổ sung các biến server còn thiếu rồi khởi động lại service.

Kiểm tra toàn bộ cấu hình backend và các bảng mà không in giá trị secret:

```bash
npm run backend:check
```

Do `/api/health` kiểm tra readiness thật, Render sẽ không đánh dấu phiên bản mới khỏe khi database chưa được khởi tạo. Hãy chạy migration và cấu hình environment trước lần deploy production tiếp theo.
