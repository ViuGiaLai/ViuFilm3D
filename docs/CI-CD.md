# CI/CD ViuFilm3D với Jenkins

Hệ thống CI/CD của ViuFilm3D sử dụng **Jenkins Declarative Pipeline** (định nghĩa tại file `Jenkinsfile` ở thư mục gốc của repository) để tự động hóa quy trình kiểm thử, đóng gói Docker image và triển khai ứng dụng.

---

## 1. Kiến trúc luồng triển khai (Jenkins Pipeline)

Quy trình triển khai tự động gồm 5 giai đoạn chính:

```
[GitHub Push / Webhook]
       ↓
[Stage 1: Checkout]          → Kéo mã nguồn mới nhất từ GitHub
       ↓
[Stage 2: Validate & Test]   → Chạy `npm ci`, `npm run typecheck`, `npm run format:check`
       ↓
[Stage 3: Build Docker]      → Đóng gói image `viufilm3d:latest` từ Dockerfile
       ↓
[Stage 4: Deploy Container]  → Dừng container cũ, bật container mới với `--env-file .env.local`
       ↓
[Stage 5: Health Check]      → Kiểm tra endpoint `/api/health` đảm bảo ứng dụng live
       ↓
[Post: Cleanup]              → Dọn dẹp các dangling Docker images (`docker image prune -f`)
```

---

## 2. Hướng dẫn cài đặt Jenkins (Dùng Docker)

### Cách chạy Jenkins có quyền điều khiển Docker:

Chạy lệnh sau trên máy chủ cài đặt Jenkins:

```bash
docker run -d \
  --name jenkins \
  --restart always \
  -p 8080:8080 -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which docker):/usr/bin/docker \
  -u root \
  jenkins/jenkins:lts
```

> **Ghi chú**: Tham số `-v /var/run/docker.sock:/var/run/docker.sock` cho phép Jenkins bên trong container có thể build và chạy các Docker container trên máy host.

---

## 3. Cấu hình Job trên Jenkins

1. **Đăng nhập Jenkins**: Mở trình duyệt vào `http://<IP-của-bạn>:8080`.
2. **Cài đặt Plugins cần thiết**:
   - Vào **Manage Jenkins → Plugins → Available Plugins**.
   - Cài đặt: **Pipeline**, **Git**, **GitHub Integration Plugin**, **AnsiColor**.
3. **Tạo Item mới**:
   - Chọn **New Item** → Đặt tên `ViuFilm3D` → Chọn **Pipeline** → Nhấn **OK**.
4. **Cấu hình Pipeline**:
   - Tại mục **Build Triggers**: Chọn **GitHub hook trigger for GITScm polling**.
   - Tại mục **Pipeline**:
     - **Definition**: Chọn `Pipeline script from SCM`.
     - **SCM**: Chọn `Git`.
     - **Repository URL**: `https://github.com/ViuGiaLai/ViuFilm3D.git`.
     - **Branch Specifier**: `*/main`.
     - **Script Path**: `Jenkinsfile`.
   - Nhấn **Save**.

---

## 4. Cấu hình Webhook trên GitHub để tự động Build

Để Jenkins tự động kích hoạt mỗi khi bạn `git push` lên GitHub:

1. Mở repository trên GitHub: `https://github.com/ViuGiaLai/ViuFilm3D`.
2. Vào **Settings → Webhooks → Add webhook**.
3. Điền các thông tin:
   - **Payload URL**: `http://<IP-hoặc-Domain-Jenkins>:8080/github-webhook/` _(lưu ý có dấu `/` ở cuối)_.
   - **Content type**: `application/json`.
   - **Which events would you like to trigger this webhook?**: Chọn `Just the push event`.
4. Nhấn **Add webhook**.

---

## 5. File cấu hình môi trường (.env.local)

Khi Jenkins chạy deploy, container sẽ sử dụng file `.env.local` tại thư mục làm việc của máy chủ triển khai. Hãy đảm bảo các biến sau được cấu hình:

```env
NEXT_PUBLIC_API_MODE=production
NEXT_PUBLIC_SUPABASE_URL=https://rhagyjokfcdtbhsnqgyz.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_URL=https://rhagyjokfcdtbhsnqgyz.supabase.co
SUPABASE_ANON_KEY=sb_publishable_...
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=https://...r2.cloudflarestorage.com
R2_BUCKET=viufilm-media
ADMIN_EMAIL=adminviu@gmail.com
ADMIN_PASSWORD=...
AUTH_SECRET=...
```

---

## 6. Chạy Pipeline thủ công

Trên giao diện Jenkins:
Vào Job **ViuFilm3D** → Nhấn **Build Now**. Bạn có thể bấm vào số build và chọn **Console Output** để theo dõi từng bước build và deploy theo thời gian thực.
