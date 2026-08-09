# 🎫 Event Ticket Booking Platform - Backend REST APIs (GEEK UP Assignment)

Hệ thống Backend RESTful API xử lý Đặt Vé Ca Nhạc (Flash Sale) chịu tải cao, giải quyết bài toán **Chống Overselling (Bán vượt vé)**, **Idempotency (Chống trùng đơn khi click đúp)**, **Phân quyền người dùng (JWT Role-based)** và **Quản trị Dashboard**.

---

## 🛠️ Công Nghệ & Hạ Tầng (Tech Stack)

- **Language & Framework**: Node.js (TypeScript) + Express.js
- **Architecture**: Mô hình 3 Lớp chuẩn chỉ (**Controllers ➔ Services ➔ Repositories**)
- **Database**: PostgreSQL (Local) + Prisma ORM v7
- **Cache & Lock**: Redis Cloud (Idempotency Key 24h TTL, Rate-limiting & Fast Cache)
- **Authentication**: JWT (JSON Web Token) với 3 vai trò: `Customer`, `Operator`, `Admin`
- **Testing**: Jest Unit Tests
- **API Documentation**: Swagger UI (OpenAPI 3.0) tại `/api-docs`

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án (Getting Started)

### 1. Cấu Hình Biến Môi Trường (`.env`)
Tạo file `.env` tại thư mục gốc với nội dung:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ticketbooking?schema=public"
JWT_SECRET="geekup_super_secret_jwt_key_2026"
REDIS_URL="redis://default:<REDIS_PASSWORD>@<REDIS_HOST>:<REDIS_PORT>"
```

### 2. Cài Đặt Dependencies & Generate Prisma Client
```bash
npm install
npx prisma generate
```

### 3. Nạp Dữ Liệu Mẫu Cho PostgreSQL (Database Seeding)
- Mở **pgAdmin 4** (hoặc DBeaver).
- Mở **Query Tool** kết nối với database `ticketbooking`.
- Copy toàn bộ nội dung file [Database/Data.sql](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/Database/Data.sql) dán vào và nhấn **Execute (F5)**.

*Mật khẩu tất cả tài khoản mẫu sau khi seed là: `password123`*

### 4. Khởi Chạy Server
```bash
npm run dev
```
- Server chạy tại: `http://localhost:3000`
- Giao diện Swagger API Docs: `http://localhost:3000/api-docs`

### 5. Chạy Unit Tests
```bash
npm test
```

---

## 📑 Danh Sách Tài Liệu Dự Án (Project Deliverables)

- 📜 [SYSTEM_DESIGN.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/SYSTEM_DESIGN.md): Thiết kế Kiến trúc 3 Lớp, ERD, Sequence Diagram và giải pháp chống Oversell & Idempotency.
- 📋 [ASSUMPTIONS_AND_LIMITATIONS.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/ASSUMPTIONS_AND_LIMITATIONS.md): Nêu rõ các Giả định Kinh doanh, Phạm vi Tính năng đã làm & Giới hạn hệ thống.
- 🧪 [TEST_PLAN.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/TEST_PLAN.md): Kịch bản kiểm thử API từng bước chi tiết trên Postman.
- 🗺️ [FLOW.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/FLOW.md): Ánh xạ đầy đủ các yêu cầu đề bài sang API Endpoints.