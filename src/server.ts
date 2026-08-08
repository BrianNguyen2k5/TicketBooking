import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { prisma } from "./config/db";
import "./config/redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Simple Health Check & Database Connection Test
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
