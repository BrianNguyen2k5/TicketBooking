# Lộ Trình Chi Tiết Thực Hiện Bài Test Event Ticket Booking (GEEK UP)

Bài test yêu cầu thiết kế và hiện thực hệ thống backend cho ứng dụng **Đặt Vé Xem Ca Nhạc (Concert Ticket Booking Platform)** chịu tải cho sự kiện **Flash Sale** (~50.000 users, peak 300-500 requests/phút). Yêu cầu trọng tâm nằm ở **tư duy kiến trúc (engineering thinking)**, **giải quyết bài toán quy mô (overselling, idempotency, race condition)** và **cấu trúc mã nguồn 3 lớp (Controllers - Services - Repositories) chuẩn chỉ**.

---

## 🎯 Mục Tiêu Đạt Được

1. **Tài liệu Thiết kế Kiến trúc & Cơ sở dữ liệu (System & Database Design Document)**: Giải thích rõ tư duy thiết kế, ERD, Sequence Diagram, cùng phân tích trade-off các giải pháp chống oversell & race condition.
2. **Codebase hoàn chỉnh (Backend REST APIs)**: Dựng bằng Node.js + Express (TypeScript), tuân thủ nghiêm ngặt **Mô hình 3 Lớp (Controller -> Service -> Repository)**.
3. **Bộ Tài liệu Assumptions, Scope & Limitations**: Nêu rõ các giả định kinh doanh, những phần đã thực hiện và giới hạn phạm vi hệ thống.
4. **Bộ Test & API Documentation**: Swagger UI / OpenAPI, Postman Collection chạy trực tiếp với Docker Local, kèm Unit/Integration Tests.

---

## 🛠️ Công Nghệ & Kiến Trúc Đề Xuất (Updated Tech Stack & Architecture)

- **Language & Runtime**: **Node.js (TypeScript)**
- **Web Framework**: **Express.js** (Nhẹ nhàng, phổ biến, dễ tùy biến).
- **Mô Hình Kiến Trúc (3-Layer Architecture)**:
  - **Controllers Layer**: Tiếp nhận HTTP Request, validate dữ liệu đầu vào (zod / express-validator), gọi Service và trả về HTTP Response.
  - **Services Layer**: Chứa toàn bộ Business Logic (Đặt vé, giữ chỗ, kiểm tra Voucher, xử lý thanh toán, lock đồng thời).
  - **Repositories Layer**: Đảm nhiệm việc giao tiếp với Database (ORM/Query Builder như Prisma/Knex/Raw SQL), thực thi các câu truy vấn và giao dịch (transactions).
- **Database**: **PostgreSQL** (Quản lý giao dịch ACID chuẩn xác cho Booking & Payment).
- **Cache & Concurrency**: **Redis** (Lưu trữ Idempotency Key, Atomic lock chống Oversell, Caching).
- **Môi trường**: **Docker & Docker Compose** (`docker-compose.yml` bao gồm App, Postgres, Redis).

---

## 📁 Cấu Trúc Mã Nguồn Đề Xuất (Folder Structure)

```text
src/
├── config/             # DB, Redis, Environment configurations
├── constants/          # Enums, Status code, Error messages
├── controllers/        # HTTP Handlers (Customer & Admin)
├── services/           # Core Business Logic & Concurrency Control
├── repositories/       # Database queries & transactions
├── middlewares/        # Authentication, Error handling, Idempotency check
├── utils/              # Helper functions (Redis lock, Logger)
├── dtos/               # Request/Response data validation schemas
├── routes/             # Express Router definitions
├── types/              # TypeScript interface definitions
└── app.ts / server.ts  # Express app configuration & server startup
```

---

## 🗺️ Lộ Trình Thực Hiện (5 Giai Đoạn)

### Giai Đoạn 1: Phân Tích Phạm Vi & Thiết Kế Kiến Trúc (System Design)

- [ ] **1.1. Phân định Bounded Contexts**:
  - _Customer Context_: Browse Concerts, Reserve Tickets, Apply Voucher, Payment Callback, Order History.
  - _Operation Context_: View Dashboard Metrics, Manage Concerts/Tickets, Manage Vouchers, Resolve Failed/Suspicious Bookings.
- [ ] **1.2. Thiết kế ERD (Database Schema)**:
  - `users`: id, email, name, role (CUSTOMER, OPERATOR, ADMIN).
  - `concerts`: id, title, description, start_time, status.
  - `ticket_categories`: id, concert_id, name, price, total_quantity, available_quantity.
  - `bookings`: id, user_id, status (PENDING_PAYMENT, PAID, CANCELLED, EXPIRED), total_amount, discount_amount, final_amount, idempotency_key, created_at, expires_at.
  - `booking_items`: id, booking_id, ticket_category_id, quantity, unit_price.
  - `vouchers`: id, code, discount_type (PERCENTAGE/FIXED), discount_value, max_usage, current_usage, start_date, end_date.
  - `voucher_usages`: id, voucher_id, user_id, booking_id, used_at.
- [ ] **1.3. Phân Tích Giải Pháp Kỹ Thuật Trọng Tâm (Technical Trade-offs)**:
  - **Chống Oversell**: So sánh giữa _Pessimistic Lock (`SELECT ... FOR UPDATE`)_ vs _Optimistic Lock (Atomic SQL UPDATE)_ vs _Redis DECRBY / Distributed Lock_. Chốt giải pháp tối ưu cho bài test.
  - **Chống Duplicate Request (Idempotency)**: Middleware đọc header `Idempotency-Key` lưu trong Redis/DB với TTL.
  - **Chống Lạm Dụng Voucher**: Quản lý giới hạn sử dụng (Atomic count) và đảm bảo 1 user chỉ xài 1 lần (`UNIQUE(user_id, voucher_id)`).
  - **Xử lý Vé hết hạn thanh toán (Hold Timeout)**: Chiến lược nhả vé hết hạn (Cron Job / Background Worker).

---

### Giai Đoạn 2: Khởi Tạo Dự Án & Dựng Infrastructure

- [ ] **2.1. Khởi tạo repository & Docker**:
  - Dựng file `docker-compose.yml` bao gồm App Node.js, Postgres, Redis.
  - Setup Express + TypeScript, ESLint, Prettier, Gitignore.
- [ ] **2.2. Setup Database & ORM/Repository**:
  - Cấu hình Prisma / TypeORM / Knex kết nối PostgreSQL & Redis.
  - Viết file Migration khởi tạo các bảng.
  - Viết script `seed` dữ liệu mẫu (Sample Concerts, Ticket Categories, Vouchers, Admin/Customer accounts).
- [ ] **2.3. Cấu hình Common Middlewares**:
  - Global Error Handling Middleware, Async Handler wrapper, Swagger UI setup.

---

### Giai Đoạn 3: Phát Triển Core APIs (Mô Hình 3 Lớp) - Customer Flow

- [ ] **3.1. Concert & Ticket Browsing**:
  - `ConcertController` -> `ConcertService` -> `ConcertRepository`
  - `GET /api/v1/concerts`: Danh sách sự kiện.
  - `GET /api/v1/concerts/:id`: Chi tiết sự kiện & số lượng vé khả dụng.
- [ ] **3.2. Ticket Reservation (Tải cao & Concurrency trọng tâm)**:
  - `BookingController` -> `BookingService` -> `BookingRepository` & `TicketRepository`
  - `POST /api/v1/bookings/reserve`:
    - Middleware kiểm tra `Idempotency-Key`.
    - `BookingService` gọi `TicketRepository` thực hiện Atomic Update / DB Transaction giữ vé trong 10-15 phút.
    - Tạo `Booking` trạng thái `PENDING_PAYMENT`.
- [ ] **3.3. Voucher Application**:
  - `VoucherController` -> `VoucherService` -> `VoucherRepository`
  - `POST /api/v1/bookings/:id/apply-voucher`: Áp dụng voucher, kiểm tra điều kiện & tính lại giá.
- [ ] **3.4. Payment & Order Status**:
  - `POST /api/v1/bookings/:id/pay`: Mock callback thanh toán thành công -> chuyển trạng thái `PAID`.
  - `GET /api/v1/bookings/:id`: Xem trạng thái đơn hàng.

---

### Giai Đoạn 4: Phát Triển Internal Operation Dashboard APIs

- [ ] **4.1. Monitoring & Analytics**:
  - `AdminController` -> `AdminService` -> `BookingRepository`
  - `GET /api/v1/admin/bookings`: Đăng danh sách booking có filter.
  - `GET /api/v1/admin/dashboard/stats`: Thống kê tổng số vé bán ra, doanh thu, tỉ lệ thanh toán thành công.
- [ ] **4.2. Management APIs**:
  - `POST /api/v1/admin/concerts`: Tạo concert & các hạng vé.
  - `POST /api/v1/admin/vouchers`: Tạo chiến dịch voucher mới.
- [ ] **4.3. Manual Override Workflow**:
  - `PATCH /api/v1/admin/bookings/:id/status`: Operator can thiệp cập nhật trạng thái đơn (Hủy đơn nghi ngờ gian lận, nhả vé thủ công).

---

### Giai Đoạn 5: Kiểm Thử, Viết Tài Liệu & Đóng Gói Sản Phẩm

- [ ] **5.1. Testing**:
  - Viết **Unit Tests** cho Services & Repositories (dùng Jest).
  - Viết **Integration / Stress Test Simulation Script** (dùng Jest/k6) mô phỏng hàng loạt requests đặt vé đồng thời.
- [ ] **5.2. Chuẩn bị Postman Collection**:
  - Export Postman Collection & Environment variables có đầy đủ các luồng test.
- [ ] **5.3. Viết Tài Liệu Deliverables**:
  - `README.md`: Hướng dẫn chạy `docker-compose up`, chạy seed data và unit test.
  - `SYSTEM_DESIGN.md`: Sơ đồ Kiến trúc 3 lớp, ERD, Sequence Diagram, Phân tích kỹ thuật giải quyết Oversell & Idempotency.
  - `ASSUMPTIONS_AND_LIMITATIONS.md`: Giả định nghiệp vụ, phạm vi các tính năng đã làm / chưa làm.

---

## 📊 Kế Hoạch Kiểm Thử (Verification Plan)

### Kiểm Thử Tự Động

- `npm run test`: Chạy toàn bộ Unit test cho Services & Repositories.
- Script test concurrency (chạy script gửi nhiều HTTP requests song song đến API Reserve Ticket để verify không bị `available_quantity < 0`).

### Kiểm Thử Thủ Công

- Sử dụng Postman Collection nhập `Idempotency-Key` trùng lặp để kiểm tra API trả về cùng một kết quả mà không tạo đơn trùng.
- Kiểm tra Swagger UI tại `http://localhost:3000/api-docs`.
