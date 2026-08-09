import { prisma } from "../config/db";

export class VoucherRepository {
  async findVoucherById(voucherId: string) {
    return await prisma.voucher.findUnique({
      where: { voucherid: voucherId },
    });
  }

  async countUserUsage(userId: string, voucherId: string) {
    return await prisma.voucherUsages.count({
      where: { userid: userId, voucherid: voucherId },
    });
  }

  async updateBookingVoucher(
    bookingId: string,
    voucherId: string,
    userId: string,
    discountPrice: number,
    finalPrice: number,
  ) {
    // Đưa toàn bộ vào 1 transaction, nếu có 1 trong 3 cái mà lỗi => Callback và hủy toàn bộ thay đổi của cả 3 giao tác con
    return await prisma.$transaction(async (tx) => {
      const updateBooking = await tx.bookings.update({
        where: { bookingid: bookingId },
        data: {
          voucherid: voucherId,
          discountprice: discountPrice,
          finalprice: finalPrice,
        },
        include: {
          Voucher: true,
        },
      });

      await tx.voucher.update({
        where: { voucherid: voucherId },
        data: {
          usedcount: {
            increment: 1,
          },
        },
      });

      await tx.voucherUsages.create({
        data: {
          voucherid: voucherId,
          userid: userId,
          appliedat: new Date(),
        },
      });

      return updateBooking;
    });
  }
}

export const voucherRepository = new VoucherRepository();
