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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Demo kiểm tra, đảm bảo code connect tốt.
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

app.use("/api/v1/auth", authRoutes);
// Customer
// Browse concert (free)
// View tickets category and prices (free, get the ticket list of a concert)
app.use("/api/v1/browse", browseRoutes);

// Reserve tickets (authorize)
app.use("/api/v1/booking/reserved", bookingRoutes);

// Apply voucher (authorize)

// Track booking status (authorize)

// Admin (full authorize):
// Monitor bookings

// Manage/Publish new concert tickets (SELECT/INSERT/UPDATE/DELETE)

// Validate ticket availability

// Manage voucher campaign

// Handle failed/sus booking

// Update booking status manually

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
