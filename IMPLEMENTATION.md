# Lộ Trình Chi Tiết Thực Hiện Bài Test Event Ticket Booking (GEEK UP)

Bài test yêu cầu thiết kế và hiện thực hệ thống backend cho ứng dụng **Đặt Vé Xem Ca Nhạc (Concert Ticket Booking Platform)** chịu tải cho sự kiện **Flash Sale** (~50.000 users, peak 300-500 requests/phút). Yêu cầu trọng tâm nằm ở **tư duy kiến trúc (engineering thinking)**, **giải quyết bài toán quy mô (overselling, idempotency, race condition)** và **cấu trúc mã nguồn 3 lớp (Controllers - Services - Repositories) chuẩn chỉ**.

---

## 🎯 Mục Tiêu Đạt Được

1. **Tài liệu Thiết kế Kiến trúc & Cơ sở dữ liệu (System & Database Design Document)**: Giải thích rõ tư duy thiết kế, ERD (khớp với `DATABASE.md`), Sequence Diagram, cùng phân tích trade-off các giải pháp chống oversell & race condition.
2. **Codebase hoàn chỉnh (Backend REST APIs)**: Dựng bằng Node.js + Express (TypeScript), tuân thủ nghiêm ngặt **Mô hình 3 Lớp (Controller -> Service -> Repository)**.
3. **Bộ Tài liệu Assumptions, Scope & Limitations**: Nêu rõ các giả định kinh doanh, những phần đã thực hiện và giới hạn phạm vi hệ thống.
4. **Bộ Test & API Documentation**: Swagger UI / OpenAPI (`http://localhost:3000/api-docs`), Postman Collection kết nối trực tiếp PostgreSQL Local và Redis Cloud, kèm Unit/Integration Tests.

---

## 🛠️ Công Nghệ & Hạ Tầng Dự Án (Tech Stack & Infrastructure)

- **Language & Runtime**: **Node.js (TypeScript)**
- **Web Framework**: **Express.js** (Nhẹ nhàng, phổ biến, dễ tùy biến).
- **Mô Hình Kiến Trúc (3-Layer Architecture)**:
  - **Controllers Layer**: Tiếp nhận HTTP Request, validate dữ liệu đầu vào (Zod), gọi Service và trả về HTTP Response.
  - **Services Layer**: Chứa toàn bộ Business Logic (Đặt vé, giữ chỗ, kiểm tra Voucher, xử lý thanh toán, lock đồng thời).
  - **Repositories Layer**: Đảm nhiệm giao tiếp với Database (Prisma ORM / Raw SQL), thực thi các câu truy vấn và giao dịch (transactions).
- **Database**: **PostgreSQL Local** (Cài đặt cục bộ hoặc qua Docker Container).
- **Cache & Concurrency**: **Redis Cloud** (Gói miễn phí 30MB — lưu trữ Idempotency Key, Atomic lock chống Oversell, Caching).

---

## 📁 Cấu Trúc Mã Nguồn Đề Xuất (Folder Structure)

```text
src/
├── config/             # DB (Prisma), Redis Cloud Client, Environment configs
├── constants/          # Enums, Status code, Error messages
├── controllers/        # HTTP Handlers (Customer & Admin)
├── services/           # Core Business Logic & Concurrency Control
├── repositories/       # Database queries & transactions
├── middlewares/        # Authentication, Error handling, Idempotency check
├── utils/              # Helper functions (Redis lock, Logger)
├── dtos/               # Request/Response data validation schemas (Zod)
├── routes/             # Express Router definitions
├── types/              # TypeScript interface definitions
└── app.ts / server.ts  # Express app configuration & server startup
```

---

## 🗺️ Lộ Trình Thực Hiện (5 Giai Đoạn)

### Giai Đoạn 1: Phân Tích Phạm Vi & Chuẩn Hóa Cơ Sở Dữ Liệu (Chuẩn `DATABASE.md`)
- [x] **1.1. Chuẩn hóa Database Schema (Theo `DATABASE.md`)**:
  - `Users` (`userid`, `name`, `email`, `phonenumber`, `password`, `role`: `Customer`, `Operator`, `Admin`).
  - `Concerts` (`concertid`, `concertname`, `description`, `createdat`, `starttime`, `startdate`, `status`: `CommingSoon`, `PreSale`, `OnSale`, `SoldOut`, `Cancelled`, `Ended`).
  - `Tickets` (`ticketid`, `concertid`, `ticketname`, `priceperticket`, `totalquantity`, `availablequantity`, `createdat`, `startdatetime`, `enddatetime`, `status`: `Unavailable`, `Available`, `SoldOut`, `Cancelled`).
  - `Voucher` (`voucherid`, `vouchername`, `description`, `discounttype`: `Fixed`, `Percentage`, `discountvalue`, `maxusage`, `maxusageperuser`, `startdate`, `enddate`, `usedcount`, `status`: `Unavailable`, `Available`, `Ended`, `Cancelled`).
  - `Bookings` (`bookingid`, `userid`, `ticketid`, `concertid`, `voucherid`, `createdat`, `expiredat`, `amount`, `totalprice`, `discountprice`, `finalprice`, `paymentmethod`, `transactionid`, `paidat`, `idempotencykey`, `status`: `PendingPayment`, `Confirmed`, `Cancelled`, `Expired`).
  - `VoucherUsages` (`userid`, `voucherid`, `appliedat`).
- [x] **1.2. Phân Tích Giải Pháp Kỹ Thuật Trọng Tâm (Technical Trade-offs)**:
  - **Chống Oversell**: Kết hợp DB Transaction với *Atomic SQL UPDATE* (`UPDATE "Tickets" SET availablequantity = availablequantity - $amount WHERE ticketid = $id AND availablequantity >= $amount`) hoặc *Redis Lock / Counter*.
  - **Chống Duplicate Request (Idempotency)**: Middleware đọc `idempotencykey` lưu trên Redis Cloud với TTL (vd: 24h).
  - **Chống Lạm Dụng Voucher**: Quản lý `usedcount` atomic + ghi nhận `VoucherUsages` (`userid`, `voucherid`, `appliedat`) kiểm tra giới hạn `maxusageperuser`.
  - **Xử lý Vé hết hạn thanh toán (Hold Timeout)**: Chiến lược nhả vé hết hạn khi `expiredat` bị vượt quá mà chưa `paidat`.

---

### Giai Đoạn 2: Khởi Tạo Dự Án & Dựng Infrastructure
- [x] **2.1. Khởi tạo Repository & Cấu hình Môi trường**:
  - Setup Node.js Express + TypeScript (`tsx watch`), ESLint, Prettier, `.gitignore`.
  - Cấu hình `.env` cho **PostgreSQL Local** và **Redis Cloud (30MB Free)**.
- [x] **2.2. Setup Database & Prisma ORM**:
  - Tạo 6 bảng & Seed data bằng SQL Script trên pgAdmin 4.
  - Chạy `npx prisma db pull` & `npx prisma generate` sinh TypeScript Client tại `src/generated/prisma`.
- [x] **2.3. Cấu hình Common Middlewares & Configs**:
  - Postgres Connection Client (`src/config/db.ts` dùng Prisma 7 + Driver Adapter `@prisma/adapter-pg`).
  - Redis Cloud Connection Client (`src/config/redis.ts` dùng `ioredis`).
  - Server entry (`src/server.ts`) chạy mượt với `/health` endpoint.

---

### Giai Đoạn 3: Phát Triển Core APIs (Mô Hình 3 Lớp) - Customer Flow
- [x] **3.1. Auth & Common Utilities**:
  - JWT Auth Middleware (`authenticate`, `authorizeRole`).
  - Standard Response Helper (`sendSuccess`, `sendError`).
  - Dynamic ID Generator (`generateNextId`).
- [x] **3.2. Concert & Ticket Browsing**:
  - `ConcertController` -> `BrowseService` -> `ConcertRepository`
  - `GET /api/v1/browse`: Danh sách sự kiện & các hạng vé khả dụng.
  - `GET /api/v1/browse/:concertId`: Chi tiết sự kiện & danh sách vé `Tickets`.
- [x] **3.3. Ticket Reservation (Tải cao & Concurrency trọng tâm)**:
  - `BookingController` -> `BookingService` -> `BookingRepository` & `TicketRepository`
  - `POST /api/v1/bookings`:
    - Middleware `checkIdempotency` lưu Cache vào Redis Cloud.
    - `BookingService` gọi `TicketRepository` thực hiện Atomic Update giữ vé (`PendingPayment`) trong 10 phút.
- [x] **3.4. Voucher Application**:
  - `VoucherController` -> `VoucherService` -> `VoucherRepository`
  - `POST /api/v1/bookings/:bookingId/apply-voucher`: Áp dụng voucher, kiểm tra `maxusage`, `maxusageperuser` và tính lại `finalprice` trong Database Transaction.
- [x] **3.5. Payment & Order Status**:
  - `POST /api/v1/bookings/:bookingId/pay`: Mock callback thanh toán thành công -> chuyển trạng thái `Confirmed`, cập nhật `paidat`.
  - `GET /api/v1/bookings/my-bookings`: Xem danh sách đơn hàng đã đặt của user.
  - `GET /api/v1/bookings/:bookingId`: Xem chi tiết trạng thái đơn hàng.

---

### Giai Đoạn 4: Phát Triển Internal Operation Dashboard APIs
- [x] **4.1. Monitoring & Analytics**:
  - `AdminController` -> `AdminService` -> `AdminRepository`
  - `GET /api/v1/admin/bookings`: Xem danh sách booking có filter theo status, concertid, userid.
  - `GET /api/v1/admin/dashboard/stats`: Thống kê tổng số vé bán ra, doanh thu, tỷ lệ đơn `Confirmed`.
- [x] **4.2. Management APIs**:
  - `POST /api/v1/admin/concerts`: Tạo concert & các hạng vé `Tickets` (dùng `generateNextId`).
  - `GET /api/v1/admin/tickets/availability`: Kiểm tra số lượng vé tổng vs vé khả dụng thực tế.
  - `POST /api/v1/admin/vouchers`: Tạo chiến dịch voucher mới.
- [x] **4.3. Manual Override Workflow**:
  - `PATCH /api/v1/admin/bookings/:bookingId/status`: Operator can thiệp cập nhật trạng thái đơn (Hủy đơn nghi ngờ gian lận, tự động hoàn trả vé vào kho nếu Hủy đơn).

---

### Giai Đoạn 5: Kiểm Thử, Viết Tài Liệu & Đóng Gói Sản Phẩm
- [ ] **5.1. Testing**:
  - Viết **Unit Tests** cho Services & Repositories (dùng Jest).
  - Viết **Integration / Stress Test Script** (dùng Jest/k6) mô phỏng hàng loạt requests đặt vé đồng thời.
- [ ] **5.2. Chuẩn bị Postman Collection**:
  - Export Postman Collection & Environment variables kết nối Postgres Local & Redis Cloud.
- [ ] **5.3. Tích Hợp Swagger UI & Viết Tài Liệu Deliverables**:
  - **Tích hợp Swagger UI (`swagger-ui-express` + `swagger-jsdoc`)**: Tự động sinh giao diện tài liệu Swagger API tương tác tại `http://localhost:3000/api-docs`.
  - `README.md`: Hướng dẫn cấu hình `.env`, nạp DB local & khởi chạy.
  - `SYSTEM_DESIGN.md`: Sơ đồ Kiến trúc 3 lớp, ERD, Sequence Diagram, Phân tích kỹ thuật giải quyết Oversell & Idempotency.
  - `ASSUMPTIONS_AND_LIMITATIONS.md`: Giả định nghiệp vụ, phạm vi các tính năng đã làm / chưa làm.

---

## 📊 Kế Hoạch Kiểm Thử (Verification Plan)

### Kiểm Thử Tự Động
- `npm run test`: Chạy toàn bộ Unit test cho Services & Repositories.
- Script test concurrency (gửi nhiều HTTP requests song song đến API Reserve Ticket để kiểm tra `availablequantity >= 0`).

### Kiểm Thử Thủ Công
- Sử dụng Postman Collection nhập `Idempotency-Key` trùng lặp để kiểm tra API trả về cùng một kết quả mà không tạo đơn trùng.
- Kiểm tra Swagger UI tương tác tại `http://localhost:3000/api-docs`.
