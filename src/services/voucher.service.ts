import { bookingRepository } from "../repositories/booking.repository";
import { voucherRepository } from "../repositories/voucher.repository";

export class VoucherService {
  async applyVoucher(bookingId: string, voucherId: string, userId: string) {
    // 1. Kiểm tra booking có tồn tại không, có phải của người dùng không và status có phải PendingPayment không
    const booking = await bookingRepository.findBoookingById(bookingId);
    if (!booking) {
      throw new Error("Fail to apply voucher. Booking not found");
    }
    if (booking.userid !== userId) {
      throw new Error(
        "Fail to apply voucher. The booking belongs to someone else",
      );
    }
    if (booking.status !== "PendingPayment") {
      throw new Error(
        "Fail to apply voucher. The booking is no longer in PendingPayment status",
      );
    }
    if (new Date() > new Date(booking.expiredat)) {
      throw new Error("Fail to apply voucher. The booking has expired");
    }
    if (booking.voucherid) {
      throw new Error(
        "Fail to apply voucher. The booking has already applied a voucher",
      );
    }

    // 2. Kiểm tra voucher có tồn tại không
    const voucher = await voucherRepository.findVoucherById(voucherId);
    if (!voucher) {
      throw new Error("Fail to apply voucher. Voucher not found");
    }

    if (voucher.status !== "Available") {
      throw new Error(
        "Fail to apply voucher. The voucher is no longer in Available status",
      );
    }

    // 3. Kiểm tra hạn dùng voucher
    const now = new Date();
    if (now > new Date(voucher.enddate)) {
      throw new Error("Fail to apply voucher. The voucher has expired");
    }
    if (now < new Date(voucher.startdate)) {
      throw new Error(
        "Fail to apply voucher. The voucher is not yet available",
      );
    }

    // 4. Kiểm tra tổng lượt dùng toàn hệ thống (Max usage)
    if (voucher.usedcount >= voucher.maxusage) {
      throw new Error(
        "Fail to apply voucher. The voucher has reached its max global usage limit",
      );
    }

    // 5. Kiểm tra giới hạn lượt dùng trên từng user (Max usage per user)
    const userVoucherCount = await voucherRepository.countUserUsage(
      userId,
      voucherId,
    );

    if (userVoucherCount >= voucher.maxusageperuser) {
      throw new Error(
        "Fail to apply voucher. You have reached max usage limit per user for this voucher",
      );
    }

    // 6. Tính số tiền giảm giá (discountPrice) và thành tiền (finalPrice)
    const totalPriceNum = Number(booking.totalprice);
    const discountValNum = Number(voucher.discountvalue);
    let discountPrice = 0;

    if (voucher.discounttype === "Fixed") {
      discountPrice = Math.min(discountValNum, totalPriceNum);
    } else if (voucher.discounttype === "Percentage") {
      discountPrice = totalPriceNum * (discountValNum / 100);
    }

    const finalPrice = Math.max(0, totalPriceNum - discountPrice);

    // 7. Cập nhật DB Transaction
    return await voucherRepository.updateBookingVoucher(
      bookingId,
      voucherId,
      userId,
      discountPrice,
      finalPrice,
    );
  }
}

export const voucherService = new VoucherService();
