import dotenv from "dotenv";
dotenv.config(); // nạp .env lên đầu tiên trước khi import DB & Redis

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { prisma } from "./config/db";
import "./config/redis";
import authRoutes from "./routes/auth.route";
import browseRoutes from "./routes/browse.route";
import bookingRoutes from "./routes/booking.route";
import adminRoutes from "./routes/admin.route";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get("/health", async (req, res) => {
  try {
    const userCount = await prisma.users.count();
    const concertCount = await prisma.concerts.count();

    res.json({
      status: "UP",
      message: "Server & PostgreSQL connected successfully!",
      data: {
        totalUsers: userCount,
        totalConcerts: concertCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: "DOWN", error: (error as Error).message });
  }
});

// 1. Auth Flow
app.use("/api/v1/auth", authRoutes);

// 2. Customer Browse Flow
app.use("/api/v1/browse", browseRoutes);

// 3. Customer Booking & Voucher & Payment Flow
app.use("/api/v1/bookings", bookingRoutes);

// 4. Admin / Operation Dashboard Flow (Protected with Operator/Admin Authorization)
app.use("/api/v1/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
