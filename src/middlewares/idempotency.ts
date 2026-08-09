import { Response, NextFunction } from "express";
import { redis } from "../config/redis";
import { sendError } from "../utils/response";
import { AuthenticatedRequest } from "../utils/auth";

export const checkIdempotency = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const idempotencyKey = req.headers["idempotency-key"] as string; // Lấy thông tin "idempotency-key" trong HTTP header

  if (!idempotencyKey) {
    return sendError(
      res,
      "Idempotency-Key header is required for ticket reservation",
      400,
    );
  }

  const redisKey = `idempotency:${idempotencyKey}`;

  try {
    // Kiểm tra xem Idempotency Key này đã có trong Redis chưa
    const cachedResponse = await redis.get(redisKey);

    if (cachedResponse) {
      const parsed = JSON.parse(cachedResponse); // Lấy response cũ có trong Redis, parse ra và gửi lại
      return res.status(parsed.statusCode).json(parsed.body);
    }

    // Gán idempotencyKey vào request để dùng ở Controller/Service
    (req as any).idempotencyKey = idempotencyKey;
    next();
  } catch (error) {
    // Nếu Redis có sự cố nhỏ, vẫn cho phép tiếp tục xử lý logic bằng cách gán idempotencyKey vào request và gọi next()
    (req as any).idempotencyKey = idempotencyKey;
    next();
  }
};

// Lưu response vào Redis Cloud (TTL 24 giờ)
export const saveIdempotencyResult = async (
  key: string,
  statusCode: number,
  body: any,
) => {
  try {
    const redisKey = `idempotency:${key}`;
    await redis.set(
      redisKey,
      JSON.stringify({ statusCode, body }),
      "EX",
      86400,
    ); // 86400s = 24h
  } catch (error) {
    console.error("Failed to save idempotency response to Redis:", error);
  }
};
