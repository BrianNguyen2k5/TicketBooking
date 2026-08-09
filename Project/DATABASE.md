# RELATIONAL DATABASE SCHEMA & DATA DICTIONARY

## 1. Lược Đồ Cơ Sở Dữ Liệu Quan Hệ (Relational Database Schema)

- **Users** (**userid**, name, email, phonenumber, password, role)
  - `userid`: Primary Key

- **Concerts** (**concertid**, concertname, description, createdat, starttime, startdate, status)
  - `concertid`: Primary Key

- **Tickets** (**ticketid**, concertid, ticketname, priceperticket, totalquantity, availablequantity, createdat, startdatetime, enddatetime, status)
  - `ticketid`: Primary Key
  - `concertid`: Foreign Key -> Concerts(concertid)

- **Voucher** (**voucherid**, vouchername, description, discounttype, discountvalue, maxusage, maxusageperuser, startdate, enddate, usedcount, status)
  - `voucherid`: Primary Key

- **Bookings** (**bookingid**, userid, ticketid, concertid, voucherid, createdat, expiredat, amount, totalprice, discountprice, finalprice, paymentmethod, transactionid, paidat, idempotencykey, status)
  - `bookingid`: Primary Key
  - `userid`: Foreign Key -> Users(userid)
  - `ticketid`: Foreign Key -> Tickets(ticketid)
  - `concertid`: Foreign Key -> Concerts(concertid)
  - `voucherid`: Foreign Key (Nullable) -> Voucher(voucherid)

- **VoucherUsages** (**userid**, **voucherid**, **appliedat**)
  - (`userid`, `voucherid`, `appliedat`): Composite Primary Key
  - `userid`: Foreign Key -> Users(userid)
  - `voucherid`: Foreign Key -> Voucher(voucherid)

---

## 2. Bảng Chú Giải Ý Nghĩa Các Cột (Data Dictionary)

### 2.1. Bảng `Users` (Người dùng)

| Tên cột       | Loại khóa | Ý nghĩa / Giải thích                                 |
| :------------ | :-------- | :--------------------------------------------------- |
| `userid`      | **PK**    | Mã định danh duy nhất của người dùng.                |
| `name`        |           | Họ và tên đầy đủ của người dùng.                     |
| `email`       |           | Địa chỉ email (Dùng để đăng nhập & nhận thông báo).  |
| `phonenumber` |           | Số điện thoại liên hệ.                               |
| `password`    |           | Mật khẩu tài khoản (Đã mã hóa hash).                 |
| `role`        |           | Vai trò tài khoản (`Customer`, `Operator`, `Admin`). |

### 2.2. Bảng `Concerts` (Sự kiện âm nhạc)

| Tên cột       | Loại khóa | Ý nghĩa / Giải thích                                                                      |
| :------------ | :-------- | :---------------------------------------------------------------------------------------- |
| `concertid`   | **PK**    | Mã định danh duy nhất của sự kiện.                                                        |
| `concertname` |           | Tên sự kiện / Show diễn âm nhạc.                                                          |
| `description` |           | Mô tả chi tiết về sự kiện.                                                                |
| `createdat`   |           | Thời điểm tạo bản ghi sự kiện.                                                            |
| `starttime`   |           | Khung giờ chính thức bắt đầu diễn ra sự kiện.                                             |
| `startdate`   |           | Ngày chính thức diễn ra sự kiện.                                                          |
| `status`      |           | Trạng thái sự kiện (`CommingSoon`, `PreSale`, `OnSale`, `SoldOut`, `Cancelled`, `Ended`). |

### 2.3. Bảng `Tickets` (Loại vé / Hạng vé)

| Tên cột             | Loại khóa | Ý nghĩa / Giải thích                                                     |
| :------------------ | :-------- | :----------------------------------------------------------------------- |
| `ticketid`          | **PK**    | Mã định danh duy nhất của hạng vé.                                       |
| `concertid`         | **FK**    | Tham chiếu đến `Concerts(concertid)`.                                    |
| `ticketname`        |           | Tên hạng vé (VD: VIP, GA, CAT 1).                                        |
| `priceperticket`    |           | Đơn giá cho 1 vé.                                                        |
| `totalquantity`     |           | Tổng số lượng vé phát hành ban đầu.                                      |
| `availablequantity` |           | Số lượng vé còn lại có thể bán.                                          |
| `createdat`         |           | Thời điểm tạo hạng vé.                                                   |
| `startdatetime`     |           | Thời điểm bắt đầu mở bán hạng vé.                                        |
| `enddatetime`       |           | Thời điểm kết thúc bán hạng vé.                                          |
| `status`            |           | Trạng thái hạng vé (`Unavailable`, `Available`, `SoldOut`, `Cancelled`). |

### 2.4. Bảng `Voucher` (Chiến dịch mã giảm giá)

| Tên cột           | Loại khóa | Ý nghĩa / Giải thích                                              |
| :---------------- | :-------- | :---------------------------------------------------------------- |
| `voucherid`       | **PK**    | Mã định danh duy nhất của voucher.                                |
| `vouchername`     |           | Mã giảm giá / Tên chiến dịch (VD: `FLASH2026`).                   |
| `description`     |           | Mô tả điều kiện áp dụng.                                          |
| `discounttype`    |           | Loại giảm giá (`Fixed`, `Percentage`).                            |
| `discountvalue`   |           | Giá trị giảm (Ví dụ: 50,000 VNĐ hoặc 10%).                        |
| `maxusage`        |           | Tổng lượt áp dụng tối đa của toàn hệ thống.                       |
| `maxusageperuser` |           | Giới hạn số lượt dùng tối đa trên từng khách hàng.                |
| `startdate`       |           | Ngày mã bắt đầu có hiệu lực.                                      |
| `enddate`         |           | Ngày hết hạn của mã.                                              |
| `usedcount`       |           | Tổng số lượt mã đã được sử dụng thành công.                       |
| `status`          |           | Trạng thái mã (`Unavailable`, `Available`, `Ended`, `Cancelled`). |

### 2.5. Bảng `Bookings` (Đơn đặt vé & Thanh toán)

| Tên cột          | Loại khóa | Ý nghĩa / Giải thích                                                    |
| :--------------- | :-------- | :---------------------------------------------------------------------- |
| `bookingid`      | **PK**    | Mã định danh duy nhất của đơn đặt vé.                                   |
| `userid`         | **FK**    | Tham chiếu đến `Users(userid)`.                                         |
| `ticketid`       | **FK**    | Tham chiếu đến `Tickets(ticketid)`.                                     |
| `concertid`      | **FK**    | Tham chiếu đến `Concerts(concertid)` (Phi chuẩn hóa để query nhanh).    |
| `voucherid`      | **FK**    | Tham chiếu đến `Voucher(voucherid)` (Cho phép Null).                    |
| `createdat`      |           | Thời điểm tạo đơn (Bắt đầu giữ chỗ).                                    |
| `expiredat`      |           | Thời điểm hết hạn giữ chỗ nếu chưa thanh toán.                          |
| `amount`         |           | Số lượng vé đặt mua.                                                    |
| `totalprice`     |           | Tổng tiền gốc (`amount` × `priceperticket`).                            |
| `discountprice`  |           | Số tiền được giảm nhờ voucher.                                          |
| `finalprice`     |           | Thành tiền thực tế phải trả (`totalprice` - `discountprice`).           |
| `paymentmethod`  |           | Phương thức thanh toán (VD: `MOMO`, `VNPAY`).                           |
| `transactionid`  |           | Mã giao dịch đối soát từ cổng thanh toán.                               |
| `paidat`         |           | Thời điểm hoàn tất thanh toán thành công.                               |
| `idempotencykey` |           | Mã UUID chống trùng lặp request khi đặt vé.                             |
| `status`         |           | Trạng thái đơn (`PendingPayment`, `Confirmed`, `Cancelled`, `Expired`). |

### 2.6. Bảng `VoucherUsages` (Lịch sử sử dụng Voucher)

| Tên cột     | Loại khóa  | Ý nghĩa / Giải thích                               |
| :---------- | :--------- | :------------------------------------------------- |
| `userid`    | **PK, FK** | Tham chiếu đến `Users(userid)`.                    |
| `voucherid` | **PK, FK** | Tham chiếu đến `Voucher(voucherid)`.               |
| `appliedat` | **PK**     | Thời điểm áp dụng voucher thành công (Khóa chính). |
