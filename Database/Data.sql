-- Làm sạch dữ liệu cũ
TRUNCATE TABLE "VoucherUsages", "Bookings", "Voucher", "Tickets", "Concerts", "Users" CASCADE;

-- 1. Seed Users (Admin, Operator, Customer)
INSERT INTO "Users" ("userid", "name", "email", "phonenumber", "password", "role") VALUES
('usr-001', 'Admin System', 'admin@geekup.vn', '0901000001', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Admin'),
('usr-002', 'Operator Anh Tu', 'anhtu.ops@geekup.vn', '0902000002', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Operator'),
('usr-003', 'Operator Minh Minh', 'minhminh.ops@geekup.vn', '0902000003', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Operator'),
('usr-004', 'Nguyen Van A', 'nguyenvana@gmail.com', '0913111222', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Customer'),
('usr-005', 'Tran Thi B', 'tranthib@gmail.com', '0913333444', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Customer'),
('usr-006', 'Le Van C', 'levanc@gmail.com', '0913555666', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Customer'),
('usr-007', 'Pham Minh D', 'phamminhd@gmail.com', '0913777888', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Customer'),
('usr-008', 'Hoang Anh E', 'hoanganhe@gmail.com', '0913999000', '$2a$12$eImiTXuWVxfM37uY4JANjOqgT4R9.n7fB2fG/jP4K8aX9.e1a2b3c', 'Customer');

-- 2. Seed Concerts
INSERT INTO "Concerts" ("concertid", "concertname", "description", "starttime", "startdate", "status") VALUES
('conc-001', 'Anh Trai Say Hi Live Concert 2026', 'Đêm nhạc hội quy tụ 30 anh trai cực hot tại SVĐ Mỹ Đình', '2026-10-15 19:30:00', '2026-10-15 00:00:00', 'OnSale'),
('conc-002', 'Lope World Tour - Ho Chi Minh City', 'Concert quy mô quốc tế của ban nhạc kịch tính nhất năm', '2026-11-20 18:00:00', '2026-11-20 00:00:00', 'PreSale'),
('conc-003', 'Chung Ket Ca Si Mat Nao 2026', 'Show diễn chung kết trao giải vinh danh', '2026-06-01 20:00:00', '2026-06-01 00:00:00', 'Ended');

-- 3. Seed Tickets
INSERT INTO "Tickets" ("ticketid", "concertid", "ticketname", "priceperticket", "totalquantity", "availablequantity", "startdatetime", "enddatetime", "status") VALUES
-- Ticket cho conc-001 (Anh Trai Say Hi)
('tkt-001', 'conc-001', 'SVIP Stand A (Sát Sân Khấu)', 3500000.00, 500, 482, '2026-08-01 10:00:00', '2026-10-14 23:59:59', 'Available'),
('tkt-002', 'conc-001', 'VIP Sit B', 2200000.00, 1500, 1450, '2026-08-01 10:00:00', '2026-10-14 23:59:59', 'Available'),
('tkt-003', 'conc-001', 'GA Standing C', 1000000.00, 5000, 4920, '2026-08-01 10:00:00', '2026-10-14 23:59:59', 'Available'),

-- Ticket cho conc-002 (Lope World Tour)
('tkt-004', 'conc-002', 'VVIP Lounge Include Gift Box', 5000000.00, 200, 200, '2026-09-01 09:00:00', '2026-11-19 23:59:59', 'Available'),
('tkt-005', 'conc-002', 'Standard Zone', 1500000.00, 2000, 2000, '2026-09-01 09:00:00', '2026-11-19 23:59:59', 'Available'),

-- Ticket cho conc-003 (Ended)
('tkt-006', 'conc-003', 'All Access Pass', 800000.00, 1000, 0, '2026-04-01 10:00:00', '2026-05-31 23:59:59', 'SoldOut');

-- 4. Seed Voucher
INSERT INTO "Voucher" ("voucherid", "vouchername", "description", "discounttype", "discountvalue", "maxusage", "maxusageperuser", "startdate", "enddate", "usedcount", "status") VALUES
('vch-001', 'FLASHSALE2026', 'Giảm 200k cho đơn đặt vé Flash Sale', 'Fixed', 200000.00, 100, 1, '2026-08-01 00:00:00', '2026-08-31 23:59:59', 3, 'Available'),
('vch-002', 'VIPDISCOUNT10', 'Giảm 10% cho hạng vé VIP', 'Percentage', 10.00, 50, 2, '2026-08-01 00:00:00', '2026-09-30 23:59:59', 1, 'Available'),
('vch-003', 'EXPIRED2025', 'Mã hết hạn đợt trước', 'Fixed', 100000.00, 20, 1, '2025-01-01 00:00:00', '2025-02-01 23:59:59', 20, 'Ended');

-- 5. Seed Bookings
INSERT INTO "Bookings" 
("bookingid", "userid", "ticketid", "concertid", "voucherid", "createdat", "expiredat", "amount", "totalprice", "discountprice", "finalprice", "paymentmethod", "transactionid", "paidat", "idempotencykey", "status") 
VALUES
-- Đơn đã hoàn tất thanh toán (Confirmed)
('bkg-001', 'usr-004', 'tkt-001', 'conc-001', 'vch-001', 
 CURRENT_TIMESTAMP - INTERVAL '2 HOURS', CURRENT_TIMESTAMP - INTERVAL '1 HOUR 50 MINUTES', 
 2, 7000000.00, 200000.00, 6800000.00, 'VNPAY', 'txn-001', CURRENT_TIMESTAMP - INTERVAL '1 HOUR 55 MINUTES', 'idem-001', 'Confirmed'),

('bkg-002', 'usr-005', 'tkt-002', 'conc-001', 'vch-002', 
 CURRENT_TIMESTAMP - INTERVAL '1 HOUR', CURRENT_TIMESTAMP - INTERVAL '50 MINUTES', 
 1, 2200000.00, 220000.00, 1980000.00, 'MOMO', 'txn-002', CURRENT_TIMESTAMP - INTERVAL '53 MINUTES', 'idem-002', 'Confirmed'),

-- Đơn đang chờ thanh toán (PendingPayment - giữ chỗ 10 phút)
('bkg-003', 'usr-006', 'tkt-003', 'conc-001', 'vch-001', 
 CURRENT_TIMESTAMP - INTERVAL '2 MINUTES', CURRENT_TIMESTAMP + INTERVAL '8 MINUTES', 
 4, 4000000.00, 200000.00, 3800000.00, NULL, NULL, NULL, 'idem-003', 'PendingPayment'),

-- Đơn quá hạn thanh toán (Expired)
('bkg-004', 'usr-007', 'tkt-003', 'conc-001', NULL, 
 CURRENT_TIMESTAMP - INTERVAL '30 MINUTES', CURRENT_TIMESTAMP - INTERVAL '20 MINUTES', 
 2, 2000000.00, 0.00, 2000000.00, NULL, NULL, NULL, 'idem-004', 'Expired'),

-- Đơn bị hủy (Cancelled)
('bkg-005', 'usr-008', 'tkt-003', 'conc-001', 'vch-001', 
 CURRENT_TIMESTAMP - INTERVAL '3 HOURS', CURRENT_TIMESTAMP - INTERVAL '2 HOURS 50 MINUTES', 
 1, 1000000.00, 200000.00, 800000.00, NULL, NULL, NULL, 'idem-005', 'Cancelled');

-- 6. Seed VoucherUsages
INSERT INTO "VoucherUsages" ("userid", "voucherid", "appliedat") VALUES
('usr-004', 'vch-001', CURRENT_TIMESTAMP - INTERVAL '2 HOURS'),
('usr-005', 'vch-002', CURRENT_TIMESTAMP - INTERVAL '1 HOUR'),
('usr-006', 'vch-001', CURRENT_TIMESTAMP - INTERVAL '2 MINUTES');