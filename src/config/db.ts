import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Khởi tạo Connection Pool (Hồ chứa kết nối DB) của thư viện 'pg'
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Adapter này đóng vai trò cầu nối, cho phép Prisma 7 giao nhiệm vụ truy vấn DB cho driver 'pg' xử lý.
const adapter = new PrismaPg(pool);

// Khởi tạo và export đối tượng PrismaClient duy nhất dùng cho toàn bộ dự án
export const prisma = new PrismaClient({
  adapter, // Truyền Driver Adapter vừa tạo ở trên vào Prisma
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"] // Trong môi trường DEV: in SQL query, lỗi và cảnh báo ra Terminal để dễ debug
      : ["error"], // Trong môi trường PROD: chỉ in lỗi để đảm bảo hiệu năng và log gọn gàng
});
