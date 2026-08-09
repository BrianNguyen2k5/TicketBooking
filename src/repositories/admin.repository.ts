import { prisma } from "../config/db";
import { generateNextId } from "../utils/idGenerator";
import {
  BookingStatus,
  ConcertStatus,
  TicketStatus,
  DiscountType,
  VoucherStatus,
} from "../generated/prisma/enums";

export class AdminRepository {
  // 1. Monitor all bookings with optional filters
  async findAllBookings(filters: {
    status?: BookingStatus;
    concertid?: string;
    userid?: string;
  }) {
    return await prisma.bookings.findMany({
      where: {
        ...(filters.status && { status: filters.status }),
        ...(filters.concertid && { concertid: filters.concertid }),
        ...(filters.userid && { userid: filters.userid }),
      },
      orderBy: { createdat: "desc" },
      include: {
        Users: true,
        Tickets: true,
        Concerts: true,
        Voucher: true,
      },
    });
  }

  // 2. Aggregate Dashboard Stats
  async getDashboardStats() {
    const totalBookings = await prisma.bookings.count();
    const confirmedBookings = await prisma.bookings.count({
      where: { status: BookingStatus.Confirmed },
    });
    const pendingBookings = await prisma.bookings.count({
      where: { status: BookingStatus.PendingPayment },
    });
    const cancelledBookings = await prisma.bookings.count({
      where: { status: BookingStatus.Cancelled },
    });

    const revenueAggregate = await prisma.bookings.aggregate({
      where: { status: BookingStatus.Confirmed },
      _sum: { finalprice: true, amount: true },
    });

    return {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue: Number(revenueAggregate._sum.finalprice || 0),
      totalTicketsSold: Number(revenueAggregate._sum.amount || 0),
    };
  }

  // --- CONCERT CRUD ---

  // CREATE Concert with Tickets
  async createConcertWithTickets(data: {
    concertname: string;
    description?: string;
    starttime: Date;
    startdate: Date;
    status?: ConcertStatus;
    tickets: Array<{
      ticketname: string;
      priceperticket: number;
      totalquantity: number;
      startdatetime: Date;
      enddatetime: Date;
      status?: TicketStatus;
    }>;
  }) {
    const concertid = await generateNextId("Concerts", "concertid");

    return await prisma.$transaction(async (tx) => {
      await tx.concerts.create({
        data: {
          concertid,
          concertname: data.concertname,
          description: data.description,
          starttime: data.starttime,
          startdate: data.startdate,
          status: data.status || ConcertStatus.OnSale,
        },
      });

      for (const t of data.tickets) {
        const ticketid = await generateNextId("Tickets", "ticketid");
        await tx.tickets.create({
          data: {
            ticketid,
            concertid,
            ticketname: t.ticketname,
            priceperticket: t.priceperticket,
            totalquantity: t.totalquantity,
            availablequantity: t.totalquantity,
            startdatetime: t.startdatetime,
            enddatetime: t.enddatetime,
            status: t.status || TicketStatus.Available,
          },
        });
      }

      return await tx.concerts.findUnique({
        where: { concertid },
        include: { Tickets: true },
      });
    });
  }

  // UPDATE Concert
  async updateConcert(
    concertid: string,
    data: Partial<{
      concertname: string;
      description: string;
      starttime: Date;
      startdate: Date;
      status: ConcertStatus;
    }>
  ) {
    return await prisma.concerts.update({
      where: { concertid },
      data,
      include: { Tickets: true },
    });
  }

  // DELETE / CANCEL Concert
  async deleteConcert(concertid: string) {
    return await prisma.concerts.update({
      where: { concertid },
      data: { status: ConcertStatus.Cancelled },
    });
  }

  // --- TICKET CRUD ---

  // CREATE Ticket Category for an existing Concert
  async addTicketToConcert(
    concertid: string,
    data: {
      ticketname: string;
      priceperticket: number;
      totalquantity: number;
      startdatetime: Date;
      enddatetime: Date;
      status?: TicketStatus;
    }
  ) {
    const ticketid = await generateNextId("Tickets", "ticketid");
    return await prisma.tickets.create({
      data: {
        ticketid,
        concertid,
        ticketname: data.ticketname,
        priceperticket: data.priceperticket,
        totalquantity: data.totalquantity,
        availablequantity: data.totalquantity,
        startdatetime: data.startdatetime,
        enddatetime: data.enddatetime,
        status: data.status || TicketStatus.Available,
      },
    });
  }

  // UPDATE Ticket Category
  async updateTicket(
    ticketid: string,
    data: Partial<{
      ticketname: string;
      priceperticket: number;
      totalquantity: number;
      availablequantity: number;
      status: TicketStatus;
    }>
  ) {
    return await prisma.tickets.update({
      where: { ticketid },
      data,
    });
  }

  // DELETE / CANCEL Ticket Category
  async deleteTicket(ticketid: string) {
    return await prisma.tickets.update({
      where: { ticketid },
      data: { status: TicketStatus.Cancelled },
    });
  }

  // Validate Real-time Ticket Availability
  async getTicketAvailability() {
    return await prisma.concerts.findMany({
      select: {
        concertid: true,
        concertname: true,
        status: true,
        Tickets: {
          select: {
            ticketid: true,
            ticketname: true,
            priceperticket: true,
            totalquantity: true,
            availablequantity: true,
            status: true,
          },
        },
      },
    });
  }

  // --- VOUCHER ---

  // Create Voucher
  async createVoucher(data: {
    vouchername: string;
    description?: string;
    discounttype: DiscountType;
    discountvalue: number;
    maxusage: number;
    maxusageperuser?: number;
    startdate: Date;
    enddate: Date;
    status?: VoucherStatus;
  }) {
    const voucherid = await generateNextId("Voucher", "voucherid");

    return await prisma.voucher.create({
      data: {
        voucherid,
        vouchername: data.vouchername,
        description: data.description,
        discounttype: data.discounttype,
        discountvalue: data.discountvalue,
        maxusage: data.maxusage,
        maxusageperuser: data.maxusageperuser || 1,
        startdate: data.startdate,
        enddate: data.enddate,
        status: data.status || VoucherStatus.Available,
      },
    });
  }

  // Manual Override Booking Status
  async updateBookingStatusWithInventory(
    bookingid: string,
    newStatus: BookingStatus
  ) {
    return await prisma.$transaction(async (tx) => {
      const currentBooking = await tx.bookings.findUnique({
        where: { bookingid },
      });

      if (!currentBooking) {
        throw new Error("Booking not found");
      }

      const previousStatus = currentBooking.status;

      if (
        (newStatus === BookingStatus.Cancelled || newStatus === BookingStatus.Expired) &&
        previousStatus !== BookingStatus.Cancelled &&
        previousStatus !== BookingStatus.Expired
      ) {
        await tx.tickets.update({
          where: { ticketid: currentBooking.ticketid },
          data: {
            availablequantity: { increment: currentBooking.amount },
          },
        });
      }

      const updatedBooking = await tx.bookings.update({
        where: { bookingid },
        data: { status: newStatus },
        include: {
          Users: true,
          Tickets: true,
          Concerts: true,
          Voucher: true,
        },
      });

      return updatedBooking;
    });
  }
}

export const adminRepository = new AdminRepository();
