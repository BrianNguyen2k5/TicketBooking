import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate, authorizeRole } from "../utils/auth";

const router = Router();

// Tất cả các Router Admin đều phải đăng nhập (authenticate) và thuộc vai trò Operator hoặc Admin
router.use(authenticate, authorizeRole("Operator", "Admin"));

// 1. Monitor all bookings with optional query filters (GET /api/v1/admin/bookings)
router.get("/bookings", (req, res) => adminController.getAllBookings(req, res));

// 2. Aggregate Dashboard Stats (GET /api/v1/admin/dashboard/stats)
router.get("/dashboard/stats", (req, res) =>
  adminController.getDashboardStats(req, res)
);

// --- CONCERT CRUD ROUTES ---

// Create Concert with tickets (POST /api/v1/admin/concerts)
router.post("/concerts", (req, res) => adminController.createConcert(req, res));

// Update Concert (PUT /api/v1/admin/concerts/:concertId)
router.put("/concerts/:concertId", (req, res) =>
  adminController.updateConcert(req, res)
);

// Cancel/Delete Concert (DELETE /api/v1/admin/concerts/:concertId)
router.delete("/concerts/:concertId", (req, res) =>
  adminController.deleteConcert(req, res)
);

// --- TICKET CRUD ROUTES ---

// Add new Ticket Category to Concert (POST /api/v1/admin/concerts/:concertId/tickets)
router.post("/concerts/:concertId/tickets", (req, res) =>
  adminController.addTicketToConcert(req, res)
);

// Update Ticket Category (PATCH /api/v1/admin/tickets/:ticketId)
router.patch("/tickets/:ticketId", (req, res) =>
  adminController.updateTicket(req, res)
);

// Cancel/Delete Ticket Category (DELETE /api/v1/admin/tickets/:ticketId)
router.delete("/tickets/:ticketId", (req, res) =>
  adminController.deleteTicket(req, res)
);

// Validate real-time ticket availability (GET /api/v1/admin/tickets/availability)
router.get("/tickets/availability", (req, res) =>
  adminController.getTicketAvailability(req, res)
);

// --- VOUCHER & BOOKING OVERRIDE ROUTES ---

// Create new voucher campaign (POST /api/v1/admin/vouchers)
router.post("/vouchers", (req, res) => adminController.createVoucher(req, res));

// Manual override booking status (PATCH /api/v1/admin/bookings/:bookingId/status)
router.patch("/bookings/:bookingId/status", (req, res) =>
  adminController.updateBookingStatus(req, res)
);

export default router;
