# 📌 Assumptions, Scope & Limitations (GEEK UP Assignment)

Tài liệu xác định các Giả định Nghiệp vụ (Business Assumptions), Phạm vi các Tính năng đã hoàn thành (Implemented Scope) và Giới hạn Kỹ thuật hiện tại của Hệ thống (Limitations & Scalability Roadmap).

---

## 1. 💡 Giả Định Nghiệp Vụ (Business Assumptions)

1. **Thời gian giữ chỗ vé (Hold Duration)**:
   - Khi khách hàng đặt vé giữ chỗ thành công qua API `POST /api/v1/bookings`, hệ thống cho phép giữ chỗ tối đa **10 phút** (`expiredat = CURRENT_TIMESTAMP + 10m`).
   - Nếu quá 10 phút khách hàng chưa gọi API thanh toán `POST /api/v1/bookings/:id/pay`, đơn hàng bị coi là hết hạn (`Expired`).

2. **Giả lập Thanh toán (Mock Payment Callback)**:
   - Trong phạm vi bài test, thanh toán cổng ngân hàng/ví điện tử (MoMo/VNPAY) được thực hiện qua API giả lập `POST /api/v1/bookings/:id/pay`. Khi nhận được thông tin giao dịch thành công, hệ thống chuyển đơn sang trạng thái `Confirmed`.

3. **Áp dụng Mã giảm giá (Voucher Logic)**:
   - Mỗi đơn hàng chỉ được áp dụng **tối đa 1 Voucher**.
   - Mỗi tài khoản người dùng chỉ được dùng 1 Voucher cụ thể theo hạn ngạch `maxusageperuser` (ví dụ 1 lần/user).

4. **Phân quyền Hệ thống (Role-based Access Control)**:
   - `Customer`: Chỉ có quyền duyệt danh sách vé, đặt vé cho chính mình, áp dụng voucher, thanh toán và xem đơn hàng của cá nhân.
   - `Operator` / `Admin`: Có toàn quyền giám sát hệ thống, xem Dashboard báo cáo, thực hiện CRUD Concerts / Tickets / Vouchers và can thiệp thủ công trạng thái đơn hàng (Manual Override).

---

## 2. ✅ Phạm Vi Các Tính Năng Đã Thực Hiện (Implemented Scope)

- [x] **Xác thực & Phân quyền**: Đăng nhập cấp JWT Token với 3 phân quyền (`Customer`, `Operator`, `Admin`).
- [x] **Duyệt Sự Kiện & Hạng Vé**: API duyệt danh sách concert, xem chi tiết kho vé khả dụng công khai.
- [x] **Đặt Vé Giữ Chỗ Chịu Tải Cao**:
  - Chống bán quá số lượng (**Overselling Prevention**) bằng **Atomic SQL UPDATE**.
  - Chống trùng đơn (**Idempotency**) bằng **Redis Cloud Cache (24h TTL)**.
- [x] **Quản Lý Mã Giảm Giá (Voucher Engine)**: Áp dụng voucher loại Cố định (`Fixed`) hoặc Phần trăm (`Percentage`), kiểm tra lượt dùng toàn hệ thống & lượt dùng cá nhân.
- [x] **Lịch Sử & Chi Tiết Đơn Hàng**: API xem toàn bộ đơn của tôi (`my-bookings`) và xem chi tiết theo mã `bookingid`.
- [x] **Bảng Điều Khiển Quản Trị (Admin Dashboard)**:
  - Thống kê tổng quan doanh thu, tổng số vé bán ra, tỷ lệ đơn `Confirmed`.
  - Giám sát toàn bộ đơn hàng toàn hệ thống kèm bộ lọc `status`, `concertid`, `userid`.
  - Bộ API **Full CRUD** hoàn chỉnh cho **Concerts**, **Tickets**, và **Vouchers**.
  - Kiểm tra tình trạng kho vé Real-time (Tổng vs Khả dụng).
  - Can thiệp thủ công trạng thái đơn hàng (**Manual Override**) & Hủy đơn nghi ngờ gian lận với cơ chế **Tự động hoàn vé ngược vào kho DB**.
- [x] **Ràng buộc Nghiệp vụ Chặt Chẽ (Domain Business Validations)**:
  - Giá vé `> 0`, Số lượng vé `> 0`, Hạn mở bán vé `startdatetime < enddatetime`.
  - Ràng buộc ngày bán vé bắt buộc phải diễn ra trước hoặc bằng ngày khởi chạy Concert (`startdate`).
  - Chống trùng tên Hạng vé trong cùng 1 Concert.
- [x] **Kiểm Thử & Tài Liệu**:
  - 100% Pass bộ **Jest Unit Tests** cho Core Services (`BookingService`, `VoucherService`).
  - Tài liệu kiểm thử chi tiết [TEST_PLAN.md](file:///d:/1_Personal/Visual-Code/2_Career/Geekup/TEST_PLAN.md).
  - Giao diện tài liệu tương tác **Swagger UI** tại `/api-docs`.

---

## 3. ⚠️ Giới Hạn Hệ Thống & Hướng Phát Triển Mở Rộng (Limitations & Scalability Roadmap)

### A. Giới Hạn Hiện Tại (Current Limitations)
1. **Hoàn vé tự động khi đơn hết hạn 10 phút (Background Expiry Cleanup)**:
   - Hiện tại đơn bị hết hạn (`Expired`) khi được truy vấn qua API. Để hoàn trả vé tự động ở background khi đúng 10 phút trôi qua mà không cần request kích hoạt, hệ thống có thể tích hợp **Cronjob Worker** hoặc **Redis Keyspace Notifications**.
2. **Webhooks Thanh Toán Thực Tế**:
   - Hiện sử dụng API Giả lập thanh toán `POST /pay` thay vì Webhook signature verification thực tế với VNPAY/MoMo.

### B. Hướng Mở Rộng Cho Hệ Thống Quy Mô Lớn (Scalability Roadmap)
1. **Message Queue (RabbitMQ / Apache Kafka)**:
   - Khi lượng truy cập vượt ngưỡng 10.000 requests/giây, chuyển luồng đặt vé sang hàng đợi bất đồng bộ (Async Queue) để xử lý buffer tải.
2. **Distributed Locking (Redlock)**:
   - Nâng cấp Distributed Locking khi mở rộng hệ thống lên nhiều cụm Server Node.js độc lập.
