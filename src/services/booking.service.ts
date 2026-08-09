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
      concertid: ticket.concertid,
      amount: data.amount,
      totalprice,
      finalprice,
      idempotencykey: data.idempotencykey,
      expiredat,
    });

    return booking;
  }
}

export const bookingService = new BookingService();
