import { bookingRepository } from "../repositories/booking.repository";
import { voucherRepository } from "../repositories/voucher.repository";

export class VoucherService {
  async applyVoucher(bookingId: string, voucherId: string, userId: string) {
    // 1. Kiểm tra booking có tồn tại không, có phải của người dùng không và status có phải PendingPayment không
    const booking = await bookingRepository.findBoookingById(bookingId);
    if (!booking) {
      throw new Error("Fail to apply vouceher. Booking not found");
    }
    if (booking.userid !== userId) {
      throw new Error(
        "Failt to apply voucher. The booking belongs to someone else",
      );
    }
    if (booking.status !== "PendingPayment") {
      throw new Error(
        "Failt to apply voucher. The booking is no longer in PendingPayment status",
      );
    }
    if (new Date() > new Date(booking.expiredat)) {
      throw new Error("Failt to apply voucher. The booking has expired");
    }
    if (booking.voucherid) {
      throw new Error(
        "Failt to apply voucher. The booking has already applied a voucher",
      );
    }

    // 2. Kiểm tra voucher có tồn tại không, có còn hạn không, có còn lượt không, còn lượt trên mỗi user không
    const voucher = await voucherRepository.findVoucherById(voucherId);
    const userVoucherCount = await voucherRepository.countUserUsage(
      userId,
      voucherId,
    );
    if (!voucher) {
      throw new Error("Fail to apply voucher. Voucher not found");
    }
    if (voucher.status !== "Available") {
      throw new Error(
        "Failt to apply voucher. The voucher is no longer in Available status",
      );
    }
    if (voucher.usedcount >= voucher.maxusage) {
      throw new Error(
        "Failt to apply voucher. The voucher has reached its max usage",
      );
    }
    if (voucher.usedcount >= voucher.maxusageperuser) {
      throw new Error(
        "Failt to apply voucher. You have reached max usage per user",
      );
    }
    if (new Date() > new Date(voucher.enddate)) {
      throw new Error("Failt to apply voucher. The voucher has expired");
    }
    if (new Date() < new Date(voucher.startdate)) {
      throw new Error(
        "Failt to apply voucher. The voucher is not yet available",
      );
    }
    if (userVoucherCount > Number(voucher.maxusageperuser)) {
      throw new Error(
        "Failt to apply voucher. You have reached max usage per user",
      );
    }

    // Tính số tiền giảm
    let discountPrice = 0;
    if (voucher.discounttype === "Fixed") {
      discountPrice = Math.max(
        0,
        Number(booking.totalprice) - Number(voucher.discountvalue),
      );
    } else if (voucher.discounttype === "Percentage") {
      discountPrice =
        Number(booking.totalprice) -
        Number(booking.totalprice) * (Number(voucher.discountvalue) / 100);
    }
    const finalPrice = Number(booking.totalprice) - discountPrice;

    // Update lại vào Booking
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
