import Redis from "ioredis";
import dotenv from "dotenv";

// nạp các biến môi trường từ file .env vào process.env
dotenv.config();

// Khởi tạo và export đối tượng kết nối Redis (Client Instance) duy nhất dùng cho toàn app
export const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,

  // thử lại  khi Redis rớt mạng đột ngột
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis Cloud successfully!");
});

redis.on("error", (err) => {
  console.error("❌ Redis Cloud Connection Error:", err.message);
});
