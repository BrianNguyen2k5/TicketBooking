import { bookingController } from "../controllers/booking.controller";
import { voucherController } from "../controllers/voucher.controller";
import { Router } from "express";
import { authenticate } from "../utils/auth";
import { checkIdempotency } from "../middlewares/idempotency";

const router = Router();

// Reserve ticket
router.post("/", authenticate, checkIdempotency, (req, res) =>
  bookingController.reserveTicket(req, res),
);

// Apply voucher
router.post("/:bookingId/apply-voucher", authenticate, (req, res) =>
  voucherController.applyVoucher(req, res),
);

export default router;
