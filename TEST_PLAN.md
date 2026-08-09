# 🧪 Complete API Test Plan (Event Ticket Booking Platform)

Tài liệu Hướng dẫn Kiểm thử Toàn diện (Test Plan) cho tất cả các APIs của hệ thống Đặt Vé Ca Nhạc. Bạn có thể làm theo từng bước (Step-by-step) trên **Postman** hoặc các công cụ test API tương tự.

---

## 🛠️ Chuẩn Bị Trước Khi Test (Pre-requisites)

1. **Khởi chạy Server**:
   ```bash
   npm run dev
   ```
   *Đảm bảo Server báo: `🚀 Server running on http://localhost:3000`*

2. **Base URL**: `http://localhost:3000/api/v1`

3. **Cập nhật Mật khẩu Test trong Database Postgres (nếu cần)**:
   ```sql
   UPDATE "Users" SET "password" = 'password123';
   ```

---

## 📋 GIAI ĐOẠN 1: KỊCH BẢN LUỒNG KHÁCH HÀNG (CUSTOMER FLOW)

### 1.1. Đăng Nhập Lấy Token Khách Hàng (Customer Login)
- **Method & URL**: `POST http://localhost:3000/api/v1/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body (JSON)**:
  ```json
  {
    "email": "nguyenvana@gmail.com",
    "password": "password123"
  }
  ```
- **Kết quả kỳ vọng (Expected Response)**: `200 OK`
  - Nhận được chuỗi `token`.
  - **Hành động**: Copy chuỗi `token` này để dùng cho tất cả các API Customer phía dưới!

---

### 1.2. Xem Danh Sách Tất Cả Concert (Browse Concerts)
- **Method & URL**: `GET http://localhost:3000/api/v1/browse`
- **Headers**: Không cần Token (Công khai)
- **Kết quả kỳ vọng**: `200 OK`
  - Trả về mảng danh sách các concert (`conc-001`, `conc-002`,...).

---

### 1.3. Xem Chi Tiết Vé Của 1 Concert (View Ticket Categories)
- **Method & URL**: `GET http://localhost:3000/api/v1/browse/conc-001`
- **Headers**: Không cần Token (Công khai)
- **Kết quả kỳ vọng**: `200 OK`
  - Trả về tên Concert và danh sách các hạng vé (`tkt-001`, `tkt-002`,...) kèm `availablequantity`.
  - **Hành động**: Chọn 1 `ticketid` (ví dụ: `tkt-001`) để làm bước đặt vé tiếp theo.

---

### 1.4. Đặt Vé Giữ Chỗ (Reserve Ticket - Tải Cao & Chống Trùng)
- **Method & URL**: `POST http://localhost:3000/api/v1/bookings`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_TOKEN>`
  - `Idempotency-Key`: `order-uuid-001` *(gõ ngẫu nhiên 1 chuỗi)*
- **Body (JSON)**:
  ```json
  {
    "ticketid": "tkt-001",
    "amount": 2
  }
  ```
- **Kết quả kỳ vọng**: `201 Created`
  - Đơn hàng được tạo thành công với mã `bookingid` (ví dụ: `bk-001`).
  - Trạng thái đơn `status`: `"PendingPayment"`.
  - `expiredat`: Hết hạn sau 10 phút.
  - **Hành động**: Lưu lại `bookingid` vừa sinh ra!

---

### 1.5. Kiểm Thử Tính Năng Idempotency (Bấm Trùng Nút Đặt Vé)
- **Method & URL**: `POST http://localhost:3000/api/v1/bookings`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_TOKEN>`
  - `Idempotency-Key`: `order-uuid-001` *(GIỮ NGUYÊN Header Idempotency-Key cũ ở Bước 1.4)*
- **Body (JSON)**: *(Giữ nguyên)*
- **Kết quả kỳ vọng**: `201 Created`
  - Trả về **KẾT QUẢ ĐÃ XỬ LÝ TRƯỚC ĐÓ** từ Cache Redis Cloud ngay lập tức!
  - **Kiểm tra**: Số lượng vé trong Database **KHÔNG bị trừ lần 2**, không có đơn `bk-002` nào bị tạo trùng!

---

### 1.6. Áp Dụng Mã Giảm Giá (Apply Voucher)
- **Method & URL**: `POST http://localhost:3000/api/v1/bookings/bk-001/apply-voucher`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "voucherid": "vch-001"
  }
  ```
- **Kết quả kỳ vọng**: `200 OK`
  - Đơn hàng `bk-001` được cập nhật `discountprice` và `finalprice` bị giảm đi chính xác.
  - Lượt sử dụng `usedcount` của voucher trong DB được tăng thêm 1.

---

### 1.7. Thanh Toán Giả Lập (Mock Payment Callback)
- **Method & URL**: `POST http://localhost:3000/api/v1/bookings/bk-001/pay`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "paymentmethod": "MOMO",
    "transactionid": "TXN-9988776655"
  }
  ```
- **Kết quả kỳ vọng**: `200 OK`
  - Trạng thái đơn hàng `status` chuyển từ `PendingPayment` ➔ **`Confirmed`**.
  - Ngày giờ thanh toán `paidat` được ghi nhận.

---

### 1.8. Xem Danh Sách Đơn Hàng Của Tôi (My Bookings History)
- **Method & URL**: `GET http://localhost:3000/api/v1/bookings/my-bookings`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_TOKEN>`
- **Kết quả kỳ vọng**: `200 OK`
  - Trả về danh sách tất cả các đơn hàng mà user này đã từng đặt.

---

### 1.9. Xem Chi Tiết 1 Đơn Hàng (Track Booking Status)
- **Method & URL**: `GET http://localhost:3000/api/v1/bookings/bk-001`
- **Headers**:
  - `Authorization`: `Bearer <CUSTOMER_TOKEN>`
- **Kết quả kỳ vọng**: `200 OK`
  - Trả về đầy đủ thông tin đơn hàng `bk-001` kèm thông tin Vé, Concert và Voucher.

---

## 🛠️ GIAI ĐOẠN 2: KỊCH BẢN BẢNG QUẢN TRỊ ADMIN / OPERATOR FLOW

### 2.1. Đăng Nhập Tài Khoản Admin (Admin Login)
- **Method & URL**: `POST http://localhost:3000/api/v1/auth/login`
- **Body (JSON)**:
  ```json
  {
    "email": "admin@geekup.vn",
    "password": "password123"
  }
  ```
- **Kết quả kỳ vọng**: `200 OK`
  - **Hành động**: Copy chuỗi Admin Token để gắn vào Header `Authorization: Bearer <ADMIN_TOKEN>`.

---

### 2.2. Giám Sát Toàn Bộ Đơn Hàng (Monitor Bookings)
- **Method & URL**: `GET http://localhost:3000/api/v1/admin/bookings?status=Confirmed`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Kết quả kỳ vọng**: `200 OK`
  - Trả về danh sách đơn hàng toàn hệ thống có lọc theo điều kiện `status=Confirmed`.

---

### 2.3. Xem Thống Kê Báo Cáo Doanh Thu & Số Vé (Dashboard Analytics)
- **Method & URL**: `GET http://localhost:3000/api/v1/admin/dashboard/stats`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Kết quả kỳ vọng**: `200 OK`
  - Trả về tổng doanh thu `totalRevenue`, tổng số vé bán ra `totalTicketsSold`, số lượng đơn theo từng trạng thái.

---

### 2.4. Kiểm Tra Tình Trạng Kho Vé Real-time (Check Ticket Availability)
- **Method & URL**: `GET http://localhost:3000/api/v1/admin/tickets/availability`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Kết quả kỳ vọng**: `200 OK`
  - Trả về bảng tổng quan từng Concert kèm số vé tổng `totalquantity` và số vé còn lại `availablequantity`.

---

### 2.5. Tạo Sự Kiện Mới Kèm Các Hạng Vé (CREATE Concert & Tickets)
- **Method & URL**: `POST http://localhost:3000/api/v1/admin/concerts`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "concertname": "Born Pink World Tour Hanoi 2026",
    "description": "Đêm nhạc đỉnh cao thế giới tại SVĐ Mỹ Đình",
    "starttime": "2026-12-01T19:00:00Z",
    "startdate": "2026-12-01T00:00:00Z",
    "tickets": [
      {
        "ticketname": "VIP Standing",
        "priceperticket": 6500000,
        "totalquantity": 1000
      },
      {
        "ticketname": "CAT 1 Seating",
        "priceperticket": 3500000,
        "totalquantity": 3000
      }
    ]
  }
  ```
- **Kết quả kỳ vọng**: `201 Created`
  - Nhận mã Concert mới sinh dạng `cnc-004` (hoặc `cnc-001` nếu DB trống).

---

### 2.6. Cập Nhật Thông Tin Concert (UPDATE Concert)
- **Method & URL**: `PUT http://localhost:3000/api/v1/admin/concerts/conc-001`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "concertname": "Anh Trai Say Hi Live Concert 2026 (Updated Super Night)",
    "status": "OnSale"
  }
  ```
- **Kết quả kỳ vọng**: `200 OK`

---

### 2.7. Thêm Hạng Vé Mới Vào Concert Có Sẵn (CREATE Ticket Category)
- **Method & URL**: `POST http://localhost:3000/api/v1/admin/concerts/conc-001/tickets`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "ticketname": "President Box Special Package",
    "priceperticket": 10000000,
    "totalquantity": 50
  }
  ```
- **Kết quả kỳ vọng**: `201 Created`

---

### 2.8. Cập Nhật Thông Tin Hạng Vé (UPDATE Ticket Category)
- **Method & URL**: `PATCH http://localhost:3000/api/v1/admin/tickets/tkt-001`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "priceperticket": 3800000,
    "status": "Available"
  }
  ```
- **Kết quả kỳ vọng**: `200 OK`

---

### 2.9. Hủy / Vô Hiệu Hóa Hạng Vé (DELETE Ticket Category)
- **Method & URL**: `DELETE http://localhost:3000/api/v1/admin/tickets/tkt-001`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Kết quả kỳ vọng**: `200 OK`
  - Hạng vé `tkt-001` chuyển trạng thái sang `Cancelled`.

---

### 2.10. Tạo Chiến Dịch Mã Giảm Giá Mới (CREATE Voucher)
- **Method & URL**: `POST http://localhost:3000/api/v1/admin/vouchers`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "vouchername": "SUPERDEAL2026",
    "description": "Giảm ngay 20% cho đơn hàng",
    "discounttype": "Percentage",
    "discountvalue": 20,
    "maxusage": 500,
    "maxusageperuser": 1,
    "startdate": "2026-08-01T00:00:00Z",
    "enddate": "2026-12-31T23:59:59Z"
  }
  ```
- **Kết quả kỳ vọng**: `201 Created`

---

### 2.11. Can Thiệp Thủ Công Trạng Thái Đơn Hàng (Manual Override & Auto Release Ticket)
- **Method & URL**: `PATCH http://localhost:3000/api/v1/admin/bookings/bk-001/status`
- **Headers**: `Authorization: Bearer <ADMIN_TOKEN>`
- **Body (JSON)**:
  ```json
  {
    "status": "Cancelled"
  }
  ```
- **Kết quả kỳ vọng**: `200 OK`
  - Đơn hàng `bk-001` bị đổi trạng thái thành `Cancelled`.
  - **Đặc biệt**: Số lượng vé trong kho `availablequantity` tự động được hoàn trả ngược lại vào Database!

---

## 🔒 GIAI ĐOẠN 3: KIỂM THỬ BẢO MẬT & PHÂN QUYỀN (SECURITY TESTS)

1. **Test Truy cập Admin bằng Token Customer**:
   - Thử gửi `GET /api/v1/admin/bookings` dùng Token Khách hàng.
   - **Kỳ vọng**: Trả về `403 Forbidden: Access denied`.

2. **Test Đặt vé khi chưa Đăng nhập**:
   - Thử gửi `POST /api/v1/bookings` không truyền Header Authorization.
   - **Kỳ vọng**: Trả về `401 Unauthorized: No token provided`.

3. **Test Áp mã Voucher không tồn tại**:
   - Thử gửi `POST /api/v1/bookings/bk-001/apply-voucher` với mã `"MALICIOUS_CODE"`.
   - **Kỳ vọng**: Trả về `400 Bad Request: Voucher code does not exist`.

---

## ✅ KẾT LUẬN

Tài liệu này phủ 100% tất cả các kịch bản sử dụng thực tế. Bạn có thể sử dụng file [TEST_PLAN.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/TEST_PLAN.md) này để kiểm thử từng bước trực tiếp trên Postman một cách mượt mà và trực quan!
