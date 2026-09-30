# Thay hình viền avatar

Chỉ cần **ảnh trong public + một dòng trong `lib/avatar-frame-media.ts`**.
Không sửa component, CSS, tài khoản hay Supabase khi chỉ thay hình của viền hiện có.
Hồ sơ lưu mã viền ổn định: giữ nguyên mã để mọi người đang trang bị nhận hình mới.
37 viền thuộc 5 bộ sưu tập, cộng lựa chọn Không viền. Viền chưa khai báo ảnh dùng SVG hiện có.

## Ví dụ thay Phàm Nhân bằng Animated WebP

Phàm Nhân có mã **realm-0**, Tiên Đế có mã **realm-14**.
Chạy từ thư mục gốc dự án:

```powershell
node scripts/prepare-frame-media.mjs "D:/Downloads/pham-nhan.webp" realm-0 1 realms 1.35
```

Script giữ chuyển động, thu ảnh về chiều rộng 320px, tạo ảnh tĩnh cho chế độ giảm chuyển động, lưu bản gốc và in dòng cấu hình cần thêm.

```text
public/assets/avatar-frames/realms/realm-0/v1/animated.webp
public/assets/avatar-frames/realms/realm-0/v1/poster.webp
assets/avatar-frames/sources/realm-0/v1/original.webp
```

Sau đó mở `lib/avatar-frame-media.ts`, thêm vào đối tượng `avatarFrameMedia`:

```ts
"realm-0": frameMedia("realms", "realm-0", 1, 1.35),
```

Không thêm hai dòng cùng mã. Nếu đã có, sửa dòng đó.
Dev: lưu cấu hình rồi tải lại trang. Production: build/deploy lại, gồm cả file public.
Ảnh dùng chung ở bình luận, hồ sơ, khung chat và quản trị dùng UserAvatar.

## Tự đặt file không chạy script

Tạo đúng thư mục trên, đặt hai file tên `animated.webp` và `poster.webp`, rồi thêm cùng dòng cấu hình.
Đường dẫn web bắt đầu `/assets/…`, không có `public` và không dùng đường dẫn ổ D:.
Chỉ bỏ file bất kỳ trực tiếp vào `public/assets/avatar-frames` sẽ không tự kích hoạt viền.
Nếu cần tên file khác, khai báo object `src`, `poster`, `version`, `animated`, `scale` thay cho hàm `frameMedia`.

## Thay lần tiếp theo

Dùng v2, không ghi đè v1 để tránh cache cũ và dễ quay lại:

```powershell
node scripts/prepare-frame-media.mjs "D:/Downloads/pham-nhan-moi.webp" realm-0 2 realms 1.35
```

Sửa một dòng:

```ts
"realm-0": frameMedia("realms", "realm-0", 2, 1.35),
```

Script từ chối phiên bản đã có trong public và không ghi đè file gốc đã lưu. Thư mục sources có sẵn để đặt ảnh đầu vào vẫn được phép. Bản gốc giữ đúng đuôi file (original.gif, original.webp hoặc original.png). Quay lại bản cũ bằng cách đổi 2 về 1.

## Các viền khác

Cú pháp: `node scripts/prepare-frame-media.mjs "ẢNH_GỐC" MÃ_VIỀN PHIÊN_BẢN BỘ_SƯU_TẬP SCALE`.
Tra mã/name/minXp tại `lib/avatar-frames.ts`; cảnh giới dùng `realm-0` đến `realm-14` theo thứ tự trong `lib/cultivation.ts`.

| Bộ sưu tập | Thư mục      | Ví dụ mã              |
| ---------- | ------------ | --------------------- |
| Cảnh giới  | realms       | realm-0, realm-14     |
| Nguyên tố  | elements     | fire, ice, thunder    |
| Linh thú   | beasts       | dragon, phoenix       |
| Đạo hạnh   | achievements | Tra mã trong danh mục |
| Đặc biệt   | special      | Tra mã trong danh mục |

Ví dụ Hỏa linh:

```powershell
node scripts/prepare-frame-media.mjs "D:/Downloads/hoa-linh.webp" fire 1 elements 1.35
```

```ts
"fire": frameMedia("elements", "fire", 1, 1.35),
```

## Không che avatar

### Tạo chuyển động từ viền tĩnh trong suốt

Phàm Nhân hiện dùng v5 từ file `jade_dragon_avatar_border_animated_q88.webp` người dùng cung cấp, giữ chuyển động của nguồn. Bản gốc tại `assets/avatar-frames/sources/realm-0/v5/original.webp`; bản web tại `public/assets/avatar-frames/realms/realm-0/v5/`. Các bản Phàm Nhân v1–v4 đã được xóa theo yêu cầu. Lần thay tiếp theo dùng v6.

```powershell
node scripts/animate-frame-media.mjs "D:/Downloads/vien-tinh-trong-suot.png" fire 2 elements
```

Script này chỉ dùng khi muốn tạo animation mới từ ảnh tĩnh, không cần chạy cho file Phàm Nhân hiện tại. Nó không ghi đè phiên bản đã có. Hình viền giữ nguyên vị trí; chỉ ánh sáng chuyển động, alpha phần giữa được giữ nguyên. Chế độ giảm chuyển động dùng poster tĩnh.

- Dùng ảnh vuông, nền trong suốt và phần giữa rỗng; không ghép sẵn khuôn mặt.
- Nền caro phải là nền của trình xem, không được vẽ sẵn vào ảnh. Script kiểm tra alpha khung đầu và từ chối ảnh không có vùng trong suốt đáng kể trước khi tạo file.
- `scale`: 1.35 nghĩa là viền rộng 135% avatar. Tăng nếu lỗ giữa nhỏ; giảm nếu viền lấn bên cạnh. Script cho phép 1–2.
- `poster.webp` là ảnh tĩnh cùng viền; script tạo từ khung đầu.
- Nếu ảnh không tải được, hệ thống dùng SVG dự phòng.
- Tiên Đế hiện v1, scale 1.55. Không sửa nó nếu chỉ đổi Phàm Nhân.
- Chỉ khi sửa tên, điều kiện mở khóa hoặc thêm viền mới mới cần sửa `lib/avatar-frames.ts` và kiểm tra quy tắc phía server.
