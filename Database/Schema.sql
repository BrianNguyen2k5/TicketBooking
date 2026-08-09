-- 0. Xóa các bảng và kiểu dữ liệu Enum cũ (nếu tồn tại)
DROP TABLE IF EXISTS "VoucherUsages", "Bookings", "Voucher", "Tickets", "Concerts", "Users" CASCADE;
DROP TYPE IF EXISTS "UserRole", "ConcertStatus", "TicketStatus", "DiscountType", "VoucherStatus", "BookingStatus" CASCADE;

-- 1. Tạo các kiểu dữ liệu Enum
CREATE TYPE "UserRole" AS ENUM ('Customer', 'Operator', 'Admin');
CREATE TYPE "ConcertStatus" AS ENUM ('CommingSoon', 'PreSale', 'OnSale', 'SoldOut', 'Cancelled', 'Ended');
CREATE TYPE "TicketStatus" AS ENUM ('Unavailable', 'Available', 'SoldOut', 'Cancelled');
CREATE TYPE "DiscountType" AS ENUM ('Fixed', 'Percentage');
CREATE TYPE "VoucherStatus" AS ENUM ('Unavailable', 'Available', 'Ended', 'Cancelled');
CREATE TYPE "BookingStatus" AS ENUM ('PendingPayment', 'Confirmed', 'Cancelled', 'Expired');

-- 2. Tạo bảng Users
CREATE TABLE "Users" (
    "userid" VARCHAR(20) PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "phonenumber" VARCHAR(50),
    "password" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'Customer'
);

-- 3. Tạo bảng Concerts
CREATE TABLE "Concerts" (
    "concertid" VARCHAR(20) PRIMARY KEY,
    "concertname" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "starttime" TIMESTAMP,
    "startdate" TIMESTAMP,
    "status" "ConcertStatus" NOT NULL DEFAULT 'CommingSoon'
);

-- 4. Tạo bảng Tickets
CREATE TABLE "Tickets" (
    "ticketid" VARCHAR(20) PRIMARY KEY,
    "concertid" VARCHAR(20) NOT NULL REFERENCES "Concerts"("concertid") ON DELETE CASCADE,
    "ticketname" VARCHAR(255) NOT NULL,
    "priceperticket" NUMERIC(12, 2) NOT NULL,
    "totalquantity" INT NOT NULL,
    "availablequantity" INT NOT NULL,
    "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startdatetime" TIMESTAMP NOT NULL,
    "enddatetime" TIMESTAMP NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'Unavailable'
);

-- 5. Tạo bảng Voucher
CREATE TABLE "Voucher" (
    "voucherid" VARCHAR(20) PRIMARY KEY,
    "vouchername" VARCHAR(255) UNIQUE NOT NULL,
    "description" TEXT,
    "discounttype" "DiscountType" NOT NULL,
    "discountvalue" NUMERIC(12, 2) NOT NULL,
    "maxusage" INT NOT NULL,
    "maxusageperuser" INT NOT NULL DEFAULT 1,
    "startdate" TIMESTAMP NOT NULL,
    "enddate" TIMESTAMP NOT NULL,
    "usedcount" INT NOT NULL DEFAULT 0,
    "status" "VoucherStatus" NOT NULL DEFAULT 'Available'
);

-- 6. Tạo bảng Bookings (Chuẩn 3NF - Quan hệ qua Tickets -> Concerts)
CREATE TABLE "Bookings" (
    "bookingid" VARCHAR(20) PRIMARY KEY,
    "userid" VARCHAR(20) NOT NULL REFERENCES "Users"("userid"),
    "ticketid" VARCHAR(20) NOT NULL REFERENCES "Tickets"("ticketid"),
    "voucherid" VARCHAR(20) REFERENCES "Voucher"("voucherid"),
    "createdat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiredat" TIMESTAMP NOT NULL,
    "amount" INT NOT NULL,
    "totalprice" NUMERIC(12, 2) NOT NULL,
    "discountprice" NUMERIC(12, 2) NOT NULL DEFAULT 0,
    "finalprice" NUMERIC(12, 2) NOT NULL,
    "paymentmethod" VARCHAR(50),
    "transactionid" VARCHAR(255),
    "paidat" TIMESTAMP,
    "idempotencykey" VARCHAR(255) UNIQUE NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PendingPayment'
);

-- 7. Tạo bảng VoucherUsages
CREATE TABLE "VoucherUsages" (
    "userid" VARCHAR(20) NOT NULL REFERENCES "Users"("userid"),
    "voucherid" VARCHAR(20) NOT NULL REFERENCES "Voucher"("voucherid"),
    "appliedat" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userid", "voucherid", "appliedat")
);

-- 8. Tạo các B-Tree Indexes Tối Ưu Hiệu Năng SQL Queries
CREATE INDEX "idx_bookings_user_created" ON "Bookings" ("userid", "createdat" DESC);
CREATE INDEX "idx_bookings_status_created" ON "Bookings" ("status", "createdat" DESC);
CREATE INDEX "idx_bookings_ticketid" ON "Bookings" ("ticketid");
CREATE INDEX "idx_bookings_status_expired" ON "Bookings" ("status", "expiredat");

CREATE INDEX "idx_tickets_concert_status" ON "Tickets" ("concertid", "status");
CREATE INDEX "idx_tickets_sale_dates" ON "Tickets" ("status", "startdatetime", "enddatetime");

CREATE INDEX "idx_concerts_status_startdate" ON "Concerts" ("status", "startdate" ASC);

CREATE INDEX "idx_vouchers_status_dates" ON "Voucher" ("status", "startdate", "enddate");
