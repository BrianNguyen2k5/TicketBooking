import { voucherService } from "../src/services/voucher.service";
import { bookingRepository } from "../src/repositories/booking.repository";
import { voucherRepository } from "../src/repositories/voucher.repository";

// Giả lập (Mock) các lớp Repository phục vụ kiểm thử cô lập cho VoucherService
jest.mock("../src/repositories/booking.repository");
jest.mock("../src/repositories/voucher.repository");

describe("VoucherService Unit Tests - Kiểm Thử Dịch Vụ Voucher", () => {
  afterEach(() => {
    // Xóa bộ nhớ tạm của Mock sau mỗi test case
    jest.clearAllMocks();
  });

  describe("applyVoucher - Áp dụng mã giảm giá", () => {
    // Test Case 1: Báo lỗi khi đơn hàng không tồn tại
    it("nên throw error nếu không tìm thấy đơn hàng", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue(null);

      await expect(
        voucherService.applyVoucher("bkg-999", "vch-001", "usr-001")
      ).rejects.toThrow("Fail to apply voucher. Booking not found");
    });

    // Test Case 2: Báo lỗi khi đơn hàng là của người dùng khác
    it("nên throw error nếu đơn hàng thuộc sở hữu của user khác", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue({
        bookingid: "bkg-001",
        userid: "usr-999",
        status: "PendingPayment",
        expiredat: new Date(Date.now() + 100000),
      });

      await expect(
        voucherService.applyVoucher("bkg-001", "vch-001", "usr-001")
      ).rejects.toThrow("Fail to apply voucher. The booking belongs to someone else");
    });

    // Test Case 3: Báo lỗi khi mã Voucher không tồn tại trong hệ thống
    it("nên throw error nếu không tìm thấy mã Voucher trong Database", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue({
        bookingid: "bkg-001",
        userid: "usr-001",
        status: "PendingPayment",
        expiredat: new Date(Date.now() + 100000),
      });
      (voucherRepository.findVoucherById as jest.Mock).mockResolvedValue(null);

      await expect(
        voucherService.applyVoucher("bkg-001", "vch-999", "usr-001")
      ).rejects.toThrow("Fail to apply voucher. Voucher not found");
    });

    // Test Case 4: Báo lỗi khi user đã dùng hết hạn ngạch cá nhân (Max usage per user)
    it("nên throw error nếu user đã đạt giới hạn số lần sử dụng tối đa của mã voucher này", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue({
        bookingid: "bkg-001",
        userid: "usr-001",
        status: "PendingPayment",
        totalprice: 1000000,
        expiredat: new Date(Date.now() + 100000),
      });

      (voucherRepository.findVoucherById as jest.Mock).mockResolvedValue({
        voucherid: "vch-001",
        status: "Available",
        startdate: new Date(Date.now() - 100000),
        enddate: new Date(Date.now() + 100000),
        usedcount: 5,
        maxusage: 10,
        maxusageperuser: 1, // Giới hạn 1 lần cho mỗi user
        discounttype: "Fixed",
        discountvalue: 200000,
      });

      // Giả lập user đã sử dụng mã này 1 lần trước đó
      (voucherRepository.countUserUsage as jest.Mock).mockResolvedValue(1);

      await expect(
        voucherService.applyVoucher("bkg-001", "vch-001", "usr-001")
      ).rejects.toThrow("Fail to apply voucher. You have reached max usage limit per user for this voucher");
    });

    // Test Case 5: Áp dụng voucher thành công và tính toán chính xác tiền được giảm
    it("nên tính toán số tiền giảm giá và thành tiền finalPrice chính xác khi đủ điều kiện", async () => {
      (bookingRepository.findBoookingById as jest.Mock).mockResolvedValue({
        bookingid: "bkg-001",
        userid: "usr-001",
        status: "PendingPayment",
        totalprice: 1000000,
        expiredat: new Date(Date.now() + 100000),
      });

      (voucherRepository.findVoucherById as jest.Mock).mockResolvedValue({
        voucherid: "vch-001",
        status: "Available",
        startdate: new Date(Date.now() - 100000),
        enddate: new Date(Date.now() + 100000),
        usedcount: 2,
        maxusage: 100,
        maxusageperuser: 1,
        discounttype: "Fixed",
        discountvalue: 200000, // Giảm 200k
      });

      // User chưa từng dùng mã này
      (voucherRepository.countUserUsage as jest.Mock).mockResolvedValue(0);

      const mockUpdatedBooking = {
        bookingid: "bkg-001",
        discountprice: 200000,
        finalprice: 800000, // 1 triệu - 200k = 800k
        voucherid: "vch-001",
      };

      (voucherRepository.updateBookingVoucher as jest.Mock).mockResolvedValue(mockUpdatedBooking);

      const result = await voucherService.applyVoucher("bkg-001", "vch-001", "usr-001");

      expect(result).toEqual(mockUpdatedBooking);
      expect(voucherRepository.updateBookingVoucher).toHaveBeenCalledWith(
        "bkg-001",
        "vch-001",
        "usr-001",
        200000,
        800000
      );
    });
  });
});
