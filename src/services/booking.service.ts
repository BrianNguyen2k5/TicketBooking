import { ticketRepository } from "../repositories/ticket.repository";
import { bookingRepository } from "../repositories/booking.repository";

export class BookingService {
  async reserveTicket(data: {
    userid: string;
    ticketid: string;
    amount: number;
    idempotencykey: string;
  }) {
    // Tìm thông tin hạng vé
    const ticket = await ticketRepository.findTicketById(data.ticketid);
    if (!ticket) {
      throw new Error("Ticket category not found");
    }

    // Chặn status khác available
    if (ticket.status !== "Available") {
      throw new Error(
        `You can not book this ticket. The ticket is currently ${ticket.status}`,
      );
    }

    // Chặn mua quá số lượng còn lại (Chống Oversell dưới tải cao)
    const success = await ticketRepository.decrementAvailableQuantity(
      data.ticketid,
      data.amount,
    );

    if (!success) {
      throw new Error(
        "Fail to book the ticket. Could be because the quantity is insufficient",
      );
    }

    // Nếu đặt vé thành công. Tính toán các thông tin khác
    const pricePerTicket = Number(ticket.priceperticket);
    const totalprice = pricePerTicket * data.amount;
    const finalprice = totalprice; // Chưa áp dụng voucher
    const expiredat = new Date(Date.now() + 10 * 60 * 1000); // 10 phút sau

    // Tạo bản ghi Booking với trạng thái PendingPayment
    const booking = await bookingRepository.createBooking({
      userid: data.userid,
      ticketid: data.ticketid,
      amount: data.amount,
      totalprice,
      finalprice,
      idempotencykey: data.idempotencykey,
      expiredat,
    });

    return booking;
  }

  async payBooking(params: {
    bookingid: string;
    userid: string;
    paymentmethod: string;
    transactionid: string;
  }) {
    const booking = await bookingRepository.findBoookingById(params.bookingid);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userid !== params.userid) {
      throw new Error("You are not authorized to pay for this booking");
    }

    if (booking.status !== "PendingPayment") {
      throw new Error("Booking is no longer in PendingPayment status");
    }

    if (new Date() > new Date(booking.expiredat)) {
      throw new Error("Booking has expired. Please reserve tickets again.");
    }

    return await bookingRepository.confirmPayment(
      params.bookingid,
      params.paymentmethod,
      params.transactionid,
    );
  }

  async getMyBookings(userid: string) {
    return await bookingRepository.findUserBookings(userid);
  }

  async getBookingById(bookingid: string, userid: string, role: string) {
    const booking = await bookingRepository.findBoookingById(bookingid);

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.userid !== userid && role === "Customer") {
      throw new Error("Forbidden: Access denied");
    }

    return booking;
  }
}

export const bookingService = new BookingService();
