import { bookingController } from "../controllers/booking.controller";
import { voucherController } from "../controllers/voucher.controller";
import { Router } from "express";
import { authenticate } from "../utils/auth";
import { checkIdempotency } from "../middlewares/idempotency";

const router = Router();

// Reserve ticket (POST /api/v1/bookings)
router.post("/", authenticate, checkIdempotency, (req, res) =>
  bookingController.reserveTicket(req, res),
);

// Apply voucher (POST /api/v1/bookings/:bookingId/apply-voucher)
router.post("/:bookingId/apply-voucher", authenticate, (req, res) =>
  voucherController.applyVoucher(req, res),
);

// Payment callback (POST /api/v1/bookings/:bookingId/pay)
router.post("/:bookingId/pay", authenticate, (req, res) =>
  bookingController.payBooking(req, res),
);

// Track user booking history (GET /api/v1/bookings/my-bookings)
router.get("/my-bookings", authenticate, (req, res) =>
  bookingController.getMyBookings(req, res),
);

// Track specific booking status (GET /api/v1/bookings/:bookingId)
router.get("/:bookingId", authenticate, (req, res) =>
  bookingController.getBookingById(req, res),
);

export default router;
