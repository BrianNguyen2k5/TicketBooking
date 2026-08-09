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

  async payBooking(req: AuthenticatedRequest, res: Response) {
    try {
      const userid = req.user!.userid;
      const bookingid = req.params.bookingId as string;
      const { paymentmethod, transactionid } = req.body;

      if (!paymentmethod || !transactionid) {
        return sendError(
          res,
          "paymentmethod and transactionid are required",
          400,
        );
      }

      const result = await bookingService.payBooking({
        bookingid,
        userid,
        paymentmethod,
        transactionid,
      });

      return sendSuccess(res, result, "Payment completed successfully!", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async getMyBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const userid = req.user!.userid;
      const bookings = await bookingService.getMyBookings(userid);
      return sendSuccess(res, bookings, "User bookings retrieved successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 500);
    }
  }

  async getBookingById(req: AuthenticatedRequest, res: Response) {
    try {
      const userid = req.user!.userid;
      const role = req.user!.role;
      const bookingid = req.params.bookingId as string;
      const booking = await bookingService.getBookingById(bookingid, userid, role);

      return sendSuccess(res, booking, "Booking details retrieved successfully", 200);
    } catch (error) {
      const statusCode = (error as Error).message.includes("Forbidden")
        ? 403
        : (error as Error).message.includes("not found")
        ? 404
        : 500;
      return sendError(res, (error as Error).message, statusCode);
    }
  }
}

export const bookingController = new BookingController();
