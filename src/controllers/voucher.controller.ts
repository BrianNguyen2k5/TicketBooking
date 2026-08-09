import { Response } from "express";
import { AuthenticatedRequest } from "../utils/auth";
import { voucherService } from "../services/voucher.service";
import { sendSuccess, sendError } from "../utils/response";

export class VoucherController {
  async applyVoucher(req: AuthenticatedRequest, res: Response) {
    try {
      const userid = req.user!.userid;
      const bookingid = req.params.bookingId as string;
      const { voucherid } = req.body;

      if (!bookingid) {
        return sendError(res, "Booking ID is required", 400);
      }
      if (!voucherid) {
        return sendError(res, "Voucher ID is required", 400);
      }

      const updatedBooking = await voucherService.applyVoucher(
        bookingid,
        voucherid,
        userid
      );

      return sendSuccess(
        res,
        updatedBooking,
        "Voucher applied successfully!",
        200,
      );
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }
}

export const voucherController = new VoucherController();
