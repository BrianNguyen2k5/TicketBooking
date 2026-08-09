import { prisma } from "../config/db";
import { generateNextId } from "../utils/idGenerator";
import { BookingStatus } from "../generated/prisma/enums";

export class BookingRepository {
  async createBooking(data: {
    userid: string;
    ticketid: string;
    concertid: string;
    amount: number;
    totalprice: number;
    finalprice: number;
    idempotencykey: string;
    expiredat: Date;
  }) {
    return await prisma.bookings.create({
      data: {
        bookingid: await generateNextId("Bookings", "bookingid"),
        userid: data.userid,
        ticketid: data.ticketid,
        concertid: data.concertid,
        amount: data.amount,
        totalprice: data.totalprice,
        finalprice: data.finalprice,
        idempotencykey: data.idempotencykey,
        expiredat: data.expiredat,
        status: BookingStatus.PendingPayment,
      },
      include: {
        Tickets: true,
        Concerts: true,
      },
    });
  }

  async findBoookingById(bookingId: string) {
    return await prisma.bookings.findUnique({
      where: { bookingid: bookingId },
      include: {
        Tickets: true,
        Concerts: true,
        Voucher: true,
      },
    });
  }

  async confirmPayment(bookingid: string, paymentmethod: string, transactionid: string) {
    return await prisma.bookings.update({
      where: { bookingid },
      data: {
        status: BookingStatus.Confirmed,
        paymentmethod,
        transactionid,
        paidat: new Date(),
      },
      include: {
        Tickets: true,
        Concerts: true,
        Voucher: true,
      },
    });
  }

  async findUserBookings(userid: string) {
    return await prisma.bookings.findMany({
      where: { userid },
      orderBy: { createdat: "desc" },
      include: {
        Tickets: true,
        Concerts: true,
        Voucher: true,
      },
    });
  }
}

export const bookingRepository = new BookingRepository();
