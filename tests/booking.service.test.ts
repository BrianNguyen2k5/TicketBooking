import { bookingService } from "../src/services/booking.service";
import { ticketRepository } from "../src/repositories/ticket.repository";
import { bookingRepository } from "../src/repositories/booking.repository";

// Giả lập (Mock) các lớp Repository để cô lập kiểm thử Unit Test cho BookingService
jest.mock("../src/repositories/ticket.repository");
jest.mock("../src/repositories/booking.repository");

describe("BookingService Unit Tests - Kiểm Thử Dịch Vụ Đặt Vé", () => {
  afterEach(() => {
    // Dọn dẹp trạng thái Mock sau mỗi test case
    jest.clearAllMocks();
  });

  describe("reserveTicket - Đặt vé giữ chỗ", () => {
    // Test Case 1: Báo lỗi nếu hạng vé không tồn tại
    it("nên throw error nếu không tìm thấy hạng vé trong Database", async () => {
      (ticketRepository.findTicketById as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingService.reserveTicket({
          userid: "usr-001",
          ticketid: "tkt-999",
          amount: 2,
          idempotencykey: "idem-123",
        })
      ).rejects.toThrow("Ticket category not found");
    });

    // Test Case 2: Báo lỗi nếu hạng vé không ở trạng thái Available (ví dụ SoldOut hoặc Cancelled)
    it("nên throw error nếu trạng thái vé không phải là Available", async () => {
      (ticketRepository.findTicketById as jest.Mock).mockResolvedValue({
        ticketid: "tkt-001",
        status: "SoldOut",
        priceperticket: 100000,
      });

      await expect(
        bookingService.reserveTicket({
          userid: "usr-001",
          ticketid: "tkt-001",
          amount: 2,
          idempotencykey: "idem-123",
        })
      ).rejects.toThrow("You can not book this ticket. The ticket is currently SoldOut");
    });

    // Test Case 3: Báo lỗi nếu kho vé không đủ số lượng (Chống Bán Vượt / Overselling under High Load)
    it("nên throw error nếu không trừ được kho vé (do số lượng vé còn lại không đủ)", async () => {
      (ticketRepository.findTicketById as jest.Mock).mockResolvedValue({
        ticketid: "tkt-001",
        status: "Available",
        priceperticket: 100000,
        concertid: "conc-001",
      });
      // Giả lập câu lệnh Atomic SQL UPDATE trả về false (0 rows updated)
      (ticketRepository.decrementAvailableQuantity as jest.Mock).mockResolvedValue(false);

      await expect(
        bookingService.reserveTicket({
          userid: "usr-001",
          ticketid: "tkt-001",
          amount: 10,
          idempotencykey: "idem-123",
        })
      ).rejects.toThrow("Fail to book the ticket. Could be because the quantity is insufficient");
    });

    // Test Case 4: Đặt vé giữ chỗ thành công khi kho vé hợp lệ
    it("nên tạo bản ghi Booking ở trạng thái PendingPayment thành công khi đủ vé", async () => {
      (ticketRepository.findTicketById as jest.Mock).mockResolvedValue({
        ticketid: "tkt-001",
        status: "Available",
        priceperticket: 100000,
        concertid: "conc-001",
      });
      (ticketRepository.decrementAvailableQuantity as jest.Mock).mockResolvedValue(true);

      const mockBooking = {
        bookingid: "bkg-001",
        userid: "usr-001",
        ticketid: "tkt-001",
        amount: 2,
        totalprice: 200000,
        finalprice: 200000,
        status: "PendingPayment",
      };

      (bookingRepository.createBooking as jest.Mock).mockResolvedValue(mockBooking);

      const result = await bookingService.reserveTicket({
        userid: "usr-001",
        ticketid: "tkt-001",
        amount: 2,
        idempotencykey: "idem-123",
      });

      expect(result).toEqual(mockBooking);
      expect(bookingRepository.createBooking).toHaveBeenCalledTimes(1);
    });
  });

  describe("payBooking - Thanh toán đơn hàng", () => {
    // Test Case 5: Báo lỗi nếu không tìm thấy mã đơn hàng
    it("nên throw error nếu không tìm thấy đơn hàng", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue(null);

      await expect(
        bookingService.payBooking({
          bookingid: "bkg-999",
          userid: "usr-001",
          paymentmethod: "MOMO",
          transactionid: "txn-123",
        })
      ).rejects.toThrow("Booking not found");
    });

    // Test Case 6: Báo lỗi nếu người thực hiện thanh toán không phải người chủ đơn hàng
    it("nên throw error nếu đơn hàng thuộc về người dùng khác", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue({
        bookingid: "bkg-001",
        userid: "usr-999", // Đơn của usr-999
        status: "PendingPayment",
        expiredat: new Date(Date.now() + 100000),
      });

      await expect(
        bookingService.payBooking({
          bookingid: "bkg-001",
          userid: "usr-001", // Nhưng usr-001 cố gắng trả tiền
          paymentmethod: "MOMO",
          transactionid: "txn-123",
        })
      ).rejects.toThrow("You are not authorized to pay for this booking");
    });

    // Test Case 7: Báo lỗi nếu đơn hàng đã quá hạn giữ chỗ 10 phút
    it("nên throw error nếu đơn hàng đã quá thời gian 10 phút giữ chỗ", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue({
        bookingid: "bkg-001",
        userid: "usr-001",
        status: "PendingPayment",
        expiredat: new Date(Date.now() - 10000), // Đã hết hạn trước đó 10 giây
      });

      await expect(
        bookingService.payBooking({
          bookingid: "bkg-001",
          userid: "usr-001",
          paymentmethod: "MOMO",
          transactionid: "txn-123",
        })
      ).rejects.toThrow("Booking has expired. Please reserve tickets again.");
    });
  });
});
