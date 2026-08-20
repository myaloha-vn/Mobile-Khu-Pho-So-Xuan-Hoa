# Xuân Hoà Số

Dự án gồm **2 ứng dụng độc lập** nằm chung một repo:

| Thư mục          | Ứng dụng                    | Mô tả                                                                 |
|------------------|-----------------------------|-----------------------------------------------------------------------|
| `apps/mini-app`  | Mini App cho người dân      | Giao diện Zalo Mini App: tin tức, phản ánh, tiện ích khu phố, trợ lý ảo |
| `apps/admin`     | Hệ thống điều hành          | Workspace quản trị 16 module, màn hình LED, giao diện mobile cho cán bộ |
| `shared/styles`  | Dùng chung                  | Font, Tailwind, biến theme                                            |

Hai app **không import lẫn nhau**. Có thể build và deploy riêng biệt.

## Chạy dự án

```bash
npm install

npm run dev:mini    # Mini App     -> http://localhost:5173
npm run dev:admin   # Điều hành    -> http://localhost:5174
```

## Build

```bash
npm run build:mini    # -> dist/mini-app
npm run build:admin   # -> dist/admin
npm run build         # build cả hai
```

## Ghi chú

- Dữ liệu hiện tại là mock (`apps/admin/src/data/mock.ts`), đăng nhập và phân quyền
  cũng là mock (`apps/admin/src/services/`). Chưa nối backend thật.
- Mỗi app có bộ shadcn/ui riêng, sửa bên này không ảnh hưởng bên kia.
- Thiết kế gốc trên Figma:
  https://www.figma.com/design/5dWMy8KeHfMRWYQVIm3gWL/Mobile-App-Xu%C3%A2n-Ho%C3%A0-S%E1%BB%91
