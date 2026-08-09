# Lộ Trình Chi Tiết Thực Hiện Bài Test Event Ticket Booking (GEEK UP)

Bài test yêu cầu thiết kế và hiện thực hệ thống backend cho ứng dụng **Đặt Vé Xem Ca Nhạc (Concert Ticket Booking Platform)** chịu tải cho sự kiện **Flash Sale** (~50.000 users, peak 300-500 requests/phút). Yêu cầu trọng tâm nằm ở **tư duy kiến trúc (engineering thinking)**, **giải quyết bài toán quy mô (overselling, idempotency, race condition)** và **cấu trúc mã nguồn 3 lớp (Controllers - Services - Repositories) chuẩn chỉ**.

---

## 🎯 Mục Tiêu Đạt Được

1. **Tài liệu Thiết kế Kiến trúc & Cơ sở dữ liệu (System & Database Design Document)**: Giải thích rõ tư duy thiết kế, ERD (khớp với `DATABASE.md`), Sequence Diagram, cùng phân tích trade-off các giải pháp chống oversell & race condition.
2. **Codebase hoàn chỉnh (Backend REST APIs)**: Dựng bằng Node.js + Express (TypeScript), tuân thủ nghiêm ngặt **Mô hình 3 Lớp (Controller -> Service -> Repository)**.
3. **Bộ Tài liệu Assumptions, Scope & Limitations**: Nêu rõ các giả định kinh doanh, những phần đã thực hiện và giới hạn phạm vi hệ thống.
4. **Bộ Test & API Documentation**: Swagger UI / OpenAPI (`http://localhost:3000/api-docs`), Postman Collection kết nối trực tiếp PostgreSQL Local và Redis Cloud, kèm Unit Tests với Jest.

---

## 🛠️ Công Nghệ & Hạ Tầng Dự Án (Tech Stack & Infrastructure)

- **Language & Runtime**: **Node.js (TypeScript)**
- **Web Framework**: **Express.js** (Nhẹ nhàng, phổ biến, dễ tùy biến).
- **Mô Hình Kiến Trúc (3-Layer Architecture)**:
  - **Controllers Layer**: Tiếp nhận HTTP Request, validate dữ liệu đầu vào, gọi Service và trả về HTTP Response.
  - **Services Layer**: Chứa toàn bộ Business Logic (Đặt vé, giữ chỗ, kiểm tra Voucher, xử lý thanh toán, lock đồng thời).
  - **Repositories Layer**: Đảm nhiệm giao tiếp với Database (Prisma ORM / Raw SQL), thực thi các câu truy vấn và giao dịch (transactions).
- **Database**: **PostgreSQL Local**
- **Cache & Concurrency**: **Redis Cloud** (Lưu trữ Idempotency Key, Atomic lock chống Oversell, Caching).

---

## 📅 CÁC GIAI ĐOẠN THỰC HIỆN DỰ ÁN

### Giai Đoạn 1: Phân Tích & Thiết Kế Kiến Trúc
- [x] **1.1. Chuẩn hóa Cơ sở dữ liệu (Database Schema)**: Tạo file `schema.prisma` chuẩn hóa các bảng `Users`, `Concerts`, `Tickets`, `Bookings`, `Voucher`, `VoucherUsages`.
- [x] **1.2. Thiết lập ID Auto-Generator**: Tự động sinh ID theo tiền tố chuẩn `usr-`, `conc-`, `tkt-`, `bkg-`, `vch-`.
- [x] **1.3. Thiết lập Kết nối Database & Redis**: Cấu hình Prisma 7 Driver Adapter & Redis Cloud Client.

---

### Giai Đoạn 2: Xây Dựng Core Service Infrastructure & Auth
- [x] **2.1. Authentication & Middleware**:
  - `POST /api/v1/auth/login`: Đăng nhập cấp JWT Token với 3 phân quyền (`Customer`, `Operator`, `Admin`).
  - Middlewares: `authenticate` & `authorizeRole`.
- [x] **2.2. Standard Response & Error Handling**: Trả về Response format chuẩn `{ success, message, data }`.

---

### Giai Đoạn 3: Phát Triển Customer Flow APIs
- [x] **3.1. Browse & View Ticket Categories**:
  - `GET /api/v1/browse`: Lấy danh sách Concerts đang mở bán.
  - `GET /api/v1/browse/:concertId`: Lấy chi tiết thông tin Concert & các hạng vé.
- [x] **3.2. Booking & Concurrency Engine (Chống Oversell)**:
  - `POST /api/v1/bookings`: Đặt vé giữ chỗ (Atomic SQL Update `availablequantity = availablequantity - amount` chống Overselling).
  - Middleware Idempotency: Cache kết quả xử lý bằng `Idempotency-Key` trên Redis Cloud (24h TTL).
- [x] **3.3. Voucher & Payment Flow**:
  - `POST /api/v1/bookings/:id/apply-voucher`: Kiểm tra hạn dùng, lượt dùng cá nhân/tổng, tính toán lại số tiền `finalprice`.
  - `POST /api/v1/bookings/:id/pay`: Giả lập thanh toán callback, chuyển trạng thái `PendingPayment` ➔ `Confirmed`.
- [x] **3.4. Track Booking Status**:
  - `GET /api/v1/bookings/my-bookings`: Danh sách lịch sử đơn hàng của tôi.
  - `GET /api/v1/bookings/:id`: Chi tiết trạng thái 1 đơn hàng cụ thể.

---

### Giai Đoạn 4: Phát Triển Internal Operation Dashboard APIs
- [x] **4.1. Monitoring & Analytics**:
  - `GET /api/v1/admin/bookings`: Xem danh sách booking có filter theo status, concertid, userid.
  - `GET /api/v1/admin/dashboard/stats`: Thống kê tổng số vé bán ra, doanh thu, tỷ lệ đơn `Confirmed`.
- [x] **4.2. Management APIs (Full CRUD)**:
  - Full CRUD Concerts (`POST`, `GET`, `PUT`, `DELETE`).
  - Full CRUD Tickets (`POST`, `PATCH`, `DELETE`).
  - Full CRUD Vouchers (`POST`, `GET`, `PUT`, `DELETE`).
  - `GET /api/v1/admin/tickets/availability`: Kiểm tra số lượng vé tổng vs vé khả dụng thực tế.
- [x] **4.3. Manual Override Workflow**:
  - `PATCH /api/v1/admin/bookings/:bookingId/status`: Operator can thiệp cập nhật trạng thái đơn (Hủy đơn nghi ngờ gian lận, tự động hoàn trả vé vào kho nếu Hủy đơn).

---

### Giai Đoạn 5: Kiểm Thử, Viết Tài Liệu & Đóng Gói Sản Phẩm
- [x] **5.1. Unit Testing**:
  - Viết **Unit Tests** cho Core Services (dùng Jest - 100% Pass 12/12 tests).
- [x] **5.2. Chuẩn bị Postman Collection & Test Plan**:
  - Kịch bản kiểm thử API từng bước chi tiết tại [TEST_PLAN.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/TEST_PLAN.md).
- [x] **5.3. Tích Hợp Swagger UI & Viết Tài Liệu Deliverables**:
  - **Tích hợp Swagger UI (`swagger-ui-express` + `swagger-jsdoc`)**: Tự động sinh giao diện tài liệu Swagger API tương tác tại `http://localhost:3000/api-docs`.
  - [README.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/README.md): Hướng dẫn cấu hình `.env`, nạp DB local & khởi chạy.
  - [SYSTEM_DESIGN.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/SYSTEM_DESIGN.md): Sơ đồ Kiến trúc 3 lớp, ERD, Sequence Diagram, Phân tích kỹ thuật giải quyết Oversell & Idempotency.
  - [ASSUMPTIONS_AND_LIMITATIONS.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/ASSUMPTIONS_AND_LIMITATIONS.md): Giả định nghiệp vụ, phạm vi các tính năng đã làm / chưa làm.
