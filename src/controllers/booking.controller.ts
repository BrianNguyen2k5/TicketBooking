import { Response } from "express";
import { AuthenticatedRequest } from "../utils/auth";
import { bookingService } from "../services/booking.service";
import { sendSuccess, sendError } from "../utils/response";
import { saveIdempotencyResult } from "../middlewares/idempotency";

export class BookingController {
  async reserveTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const userid = req.user!.userid;
      const { ticketid, amount } = req.body;
      const idempotencyKey = (req as any).idempotencyKey; // Key được Frontend (client) tạo ra

      if (!ticketid || !amount || amount <= 0) {
        return sendError(res, "Invalid ticketid or amount", 400);
      }

      const booking = await bookingService.reserveTicket({
        userid,
        ticketid,
        amount: Number(amount),
        idempotencykey: idempotencyKey,
      });

      const responseBody = {
        success: true,
        message: "Ticket reserved successfully!",
        data: booking,
      };

      // Lưu kết quả vào Cache Redis Cloud cho Idempotency key này để tránh duplication
      await saveIdempotencyResult(idempotencyKey, 201, responseBody);

      return sendSuccess(res, booking, "Ticket reserved successfully!", 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 500);
    }
  }
}

export const bookingController = new BookingController();
