import Redis from "ioredis";
import dotenv from "dotenv";

// nạp các biến môi trường từ file .env vào process.env
dotenv.config();

const retryStrategy = (times: number) => {
  const delay = Math.min(times * 50, 2000);
  return delay;
};

// Khởi tạo đối tượng kết nối Redis (Hỗ trợ cả REDIS_URL hoặc REDIS_HOST/PORT/PASSWORD)
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { retryStrategy })
  : new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy,
    });

redis.on("connect", () => {
  console.log("✅ Connected to Redis successfully!");
});

redis.on("error", (err) => {
  console.error("❌ Redis Connection Error:", err.message);
});
