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
        Tickets: false,
        Concerts: false,
        Voucher: false,
      },
    });
  }
}

export const bookingRepository = new BookingRepository();
