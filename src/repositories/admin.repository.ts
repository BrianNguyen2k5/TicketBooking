import { prisma } from "../config/db";
import { generateNextId, generateNextIds } from "../utils/idGenerator";
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
    const ticketIds = await generateNextIds("Tickets", "ticketid", data.tickets.length);

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

      for (let i = 0; i < data.tickets.length; i++) {
        const t = data.tickets[i];
        const ticketid = ticketIds[i];
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

  async deleteConcert(concertid: string) {
    return await prisma.concerts.update({
      where: { concertid },
      data: { status: ConcertStatus.Cancelled },
    });
  }

  // --- TICKET CRUD ---

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

  async deleteTicket(ticketid: string) {
    return await prisma.tickets.update({
      where: { ticketid },
      data: { status: TicketStatus.Cancelled },
    });
  }

  async getTicketAvailability(ticketid?: string) {
    if (ticketid) {
      const ticket = await prisma.tickets.findUnique({
        where: { ticketid },
        include: { Concerts: true },
      });

      if (!ticket) return null;

      return {
        ticketid: ticket.ticketid,
        ticketname: ticket.ticketname,
        concertname: ticket.Concerts.concertname,
        isAvailable: ticket.status === TicketStatus.Available && ticket.availablequantity > 0,
        availablequantity: ticket.availablequantity,
        totalquantity: ticket.totalquantity,
        status: ticket.status,
      };
    }

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

  // --- VOUCHER CRUD ---

  // CREATE Voucher
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

  // READ All Vouchers
  async findAllVouchers() {
    return await prisma.voucher.findMany({
      orderBy: { startdate: "desc" },
    });
  }

  // UPDATE Voucher
  async updateVoucher(
    voucherid: string,
    data: Partial<{
      vouchername: string;
      description: string;
      discounttype: DiscountType;
      discountvalue: number;
      maxusage: number;
      maxusageperuser: number;
      startdate: Date;
      enddate: Date;
      status: VoucherStatus;
    }>
  ) {
    return await prisma.voucher.update({
      where: { voucherid },
      data,
    });
  }

  // DELETE / CANCEL Voucher
  async deleteVoucher(voucherid: string) {
    return await prisma.voucher.update({
      where: { voucherid },
      data: { status: VoucherStatus.Cancelled },
    });
  }

  // --- BOOKING STATUS OVERRIDE ---

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
