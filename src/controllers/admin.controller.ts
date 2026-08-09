import { Response } from "express";
import { AuthenticatedRequest } from "../utils/auth";
import { adminService } from "../services/admin.service";
import { sendSuccess, sendError } from "../utils/response";
import { BookingStatus } from "../generated/prisma/enums";

export class AdminController {
  // GET /api/v1/admin/bookings
  async getAllBookings(req: AuthenticatedRequest, res: Response) {
    try {
      const { status, concertid, userid } = req.query;
      const bookings = await adminService.getAllBookings({
        status: status as BookingStatus,
        concertid: concertid as string,
        userid: userid as string,
      });

      return sendSuccess(res, bookings, "Bookings retrieved for admin", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 500);
    }
  }

  // GET /api/v1/admin/dashboard/stats
  async getDashboardStats(req: AuthenticatedRequest, res: Response) {
    try {
      const stats = await adminService.getDashboardStats();
      return sendSuccess(res, stats, "Dashboard stats retrieved successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 500);
    }
  }

  // --- CONCERT CRUD ---

  // POST /api/v1/admin/concerts
  async createConcert(req: AuthenticatedRequest, res: Response) {
    try {
      const newConcert = await adminService.createConcert(req.body);
      return sendSuccess(res, newConcert, "Concert created successfully", 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // PUT /api/v1/admin/concerts/:concertId
  async updateConcert(req: AuthenticatedRequest, res: Response) {
    try {
      const concertid = req.params.concertId as string;
      const result = await adminService.updateConcert(concertid, req.body);
      return sendSuccess(res, result, "Concert updated successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // DELETE /api/v1/admin/concerts/:concertId
  async deleteConcert(req: AuthenticatedRequest, res: Response) {
    try {
      const concertid = req.params.concertId as string;
      const result = await adminService.deleteConcert(concertid);
      return sendSuccess(res, result, "Concert cancelled successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // --- TICKET CRUD ---

  // POST /api/v1/admin/concerts/:concertId/tickets
  async addTicketToConcert(req: AuthenticatedRequest, res: Response) {
    try {
      const concertid = req.params.concertId as string;
      const result = await adminService.addTicketToConcert(concertid, req.body);
      return sendSuccess(res, result, "New ticket category added successfully", 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // PATCH /api/v1/admin/tickets/:ticketId
  async updateTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const ticketid = req.params.ticketId as string;
      const result = await adminService.updateTicket(ticketid, req.body);
      return sendSuccess(res, result, "Ticket category updated successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // DELETE /api/v1/admin/tickets/:ticketId
  async deleteTicket(req: AuthenticatedRequest, res: Response) {
    try {
      const ticketid = req.params.ticketId as string;
      const result = await adminService.deleteTicket(ticketid);
      return sendSuccess(res, result, "Ticket category cancelled successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // GET /api/v1/admin/tickets/availability
  async getTicketAvailability(req: AuthenticatedRequest, res: Response) {
    try {
      const ticketid = req.query.ticketid as string;
      const availability = await adminService.getTicketAvailability(ticketid);
      return sendSuccess(
        res,
        availability,
        ticketid
          ? `Ticket ${ticketid} availability validated successfully`
          : "Ticket availability overview retrieved",
        200
      );
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // --- VOUCHER CRUD ---

  // GET /api/v1/admin/vouchers
  async getAllVouchers(req: AuthenticatedRequest, res: Response) {
    try {
      const vouchers = await adminService.getAllVouchers();
      return sendSuccess(res, vouchers, "Vouchers retrieved successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 500);
    }
  }

  // POST /api/v1/admin/vouchers
  async createVoucher(req: AuthenticatedRequest, res: Response) {
    try {
      const newVoucher = await adminService.createVoucher(req.body);
      return sendSuccess(res, newVoucher, "Voucher created successfully", 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // PUT /api/v1/admin/vouchers/:voucherId
  async updateVoucher(req: AuthenticatedRequest, res: Response) {
    try {
      const voucherid = req.params.voucherId as string;
      const result = await adminService.updateVoucher(voucherid, req.body);
      return sendSuccess(res, result, "Voucher updated successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // DELETE /api/v1/admin/vouchers/:voucherId
  async deleteVoucher(req: AuthenticatedRequest, res: Response) {
    try {
      const voucherid = req.params.voucherId as string;
      const result = await adminService.deleteVoucher(voucherid);
      return sendSuccess(res, result, "Voucher cancelled successfully", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  // --- BOOKING STATUS OVERRIDE ---

  // PATCH /api/v1/admin/bookings/:bookingId/status
  async updateBookingStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const bookingid = req.params.bookingId as string;
      const { status } = req.body;

      const updatedBooking = await adminService.updateBookingStatus(
        bookingid,
        status as BookingStatus
      );

      return sendSuccess(
        res,
        updatedBooking,
        `Booking status updated to ${status} successfully`,
        200
      );
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }
}

export const adminController = new AdminController();
