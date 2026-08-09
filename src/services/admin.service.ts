import { adminRepository } from "../repositories/admin.repository";
import {
  BookingStatus,
  ConcertStatus,
  TicketStatus,
  DiscountType,
  VoucherStatus,
} from "../generated/prisma/enums";

export class AdminService {
  async getAllBookings(filters: {
    status?: BookingStatus;
    concertid?: string;
    userid?: string;
  }) {
    return await adminRepository.findAllBookings(filters);
  }

  async getDashboardStats() {
    return await adminRepository.getDashboardStats();
  }

  // --- CONCERT CRUD ---

  async createConcert(data: {
    concertname: string;
    description?: string;
    starttime: string;
    startdate: string;
    status?: ConcertStatus;
    tickets: Array<{
      ticketname: string;
      priceperticket: number;
      totalquantity: number;
      startdatetime: string;
      enddatetime: string;
      status?: TicketStatus;
    }>;
  }) {
    // 1. Kiểm tra các trường bắt buộc của Concert
    if (!data.concertname || !data.starttime || !data.startdate) {
      throw new Error("concertname, starttime, and startdate are required to create a concert");
    }

    const startdateObj = new Date(data.startdate);
    const starttimeObj = new Date(data.starttime);

    if (isNaN(startdateObj.getTime()) || isNaN(starttimeObj.getTime())) {
      throw new Error("Invalid date format for startdate or starttime");
    }

    if (startdateObj > starttimeObj) {
      throw new Error("Concert startdate cannot be after starttime");
    }

    // 2. Kiểm tra danh sách vé (Tickets)
    if (!data.tickets || data.tickets.length === 0) {
      throw new Error("At least one ticket category is required to create a concert");
    }

    // Kiểm tra trùng tên Hạng vé trong cùng 1 Concert
    const ticketNameSet = new Set<string>();

    const formattedTickets = data.tickets.map((t) => {
      if (!t.ticketname || t.priceperticket == null || t.totalquantity == null) {
        throw new Error("Each ticket category requires ticketname, priceperticket, and totalquantity");
      }

      if (ticketNameSet.has(t.ticketname.trim().toLowerCase())) {
        throw new Error(`Duplicate ticket category name '${t.ticketname}' inside the same concert`);
      }
      ticketNameSet.add(t.ticketname.trim().toLowerCase());

      const price = Number(t.priceperticket);
      const totalQty = Number(t.totalquantity);

      if (isNaN(price) || price <= 0) {
        throw new Error(`Price for ticket '${t.ticketname}' must be greater than 0`);
      }

      if (isNaN(totalQty) || totalQty <= 0) {
        throw new Error(`Total quantity for ticket '${t.ticketname}' must be greater than 0`);
      }

      const ticketStart = new Date(t.startdatetime || Date.now());
      const ticketEnd = new Date(t.enddatetime || Date.now() + 30 * 24 * 60 * 60 * 1000);

      if (isNaN(ticketStart.getTime()) || isNaN(ticketEnd.getTime())) {
        throw new Error(`Invalid date format for ticket '${t.ticketname}' start/end datetime`);
      }

      if (ticketStart >= ticketEnd) {
        throw new Error(`Ticket '${t.ticketname}' sale startdatetime must be strictly before enddatetime`);
      }

      return {
        ticketname: t.ticketname.trim(),
        priceperticket: price,
        totalquantity: totalQty,
        startdatetime: ticketStart,
        enddatetime: ticketEnd,
        status: t.status,
      };
    });

    return await adminRepository.createConcertWithTickets({
      concertname: data.concertname.trim(),
      description: data.description,
      starttime: starttimeObj,
      startdate: startdateObj,
      status: data.status,
      tickets: formattedTickets,
    });
  }

  async updateConcert(concertid: string, data: any) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided to update concert");
    }

    const updateData: any = {};
    if (data.concertname) updateData.concertname = data.concertname.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.starttime) {
      const st = new Date(data.starttime);
      if (isNaN(st.getTime())) throw new Error("Invalid date format for starttime");
      updateData.starttime = st;
    }
    if (data.startdate) {
      const sd = new Date(data.startdate);
      if (isNaN(sd.getTime())) throw new Error("Invalid date format for startdate");
      updateData.startdate = sd;
    }
    if (data.status) updateData.status = data.status;

    if (updateData.startdate && updateData.starttime && updateData.startdate > updateData.starttime) {
      throw new Error("Concert startdate cannot be after starttime");
    }

    return await adminRepository.updateConcert(concertid, updateData);
  }

  async deleteConcert(concertid: string) {
    return await adminRepository.deleteConcert(concertid);
  }

  // --- TICKET CRUD ---

  async addTicketToConcert(concertid: string, data: any) {
    if (!data.ticketname || data.priceperticket == null || data.totalquantity == null) {
      throw new Error("ticketname, priceperticket, and totalquantity are required to add a new ticket category");
    }

    const price = Number(data.priceperticket);
    const totalQty = Number(data.totalquantity);

    if (isNaN(price) || price <= 0) {
      throw new Error("priceperticket must be greater than 0");
    }

    if (isNaN(totalQty) || totalQty <= 0) {
      throw new Error("totalquantity must be greater than 0");
    }

    const ticketStart = new Date(data.startdatetime || Date.now());
    const ticketEnd = new Date(data.enddatetime || Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (isNaN(ticketStart.getTime()) || isNaN(ticketEnd.getTime())) {
      throw new Error("Invalid date format for ticket startdatetime or enddatetime");
    }

    if (ticketStart >= ticketEnd) {
      throw new Error("Ticket sale startdatetime must be strictly before enddatetime");
    }

    return await adminRepository.addTicketToConcert(concertid, {
      ticketname: data.ticketname.trim(),
      priceperticket: price,
      totalquantity: totalQty,
      startdatetime: ticketStart,
      enddatetime: ticketEnd,
      status: data.status,
    });
  }

  async updateTicket(ticketid: string, data: any) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided to update ticket");
    }

    const updateData: any = {};
    if (data.ticketname) updateData.ticketname = data.ticketname.trim();

    if (data.priceperticket != null) {
      const price = Number(data.priceperticket);
      if (isNaN(price) || price <= 0) throw new Error("priceperticket must be greater than 0");
      updateData.priceperticket = price;
    }

    if (data.totalquantity != null) {
      const totalQty = Number(data.totalquantity);
      if (isNaN(totalQty) || totalQty <= 0) throw new Error("totalquantity must be greater than 0");
      updateData.totalquantity = totalQty;
    }

    if (data.availablequantity != null) {
      const availQty = Number(data.availablequantity);
      if (isNaN(availQty) || availQty < 0) throw new Error("availablequantity cannot be negative");
      updateData.availablequantity = availQty;
    }

    if (data.status) updateData.status = data.status;

    return await adminRepository.updateTicket(ticketid, updateData);
  }

  async deleteTicket(ticketid: string) {
    return await adminRepository.deleteTicket(ticketid);
  }

  async getTicketAvailability(ticketid?: string) {
    const result = await adminRepository.getTicketAvailability(ticketid);
    if (ticketid && !result) {
      throw new Error("Ticket not found");
    }
    return result;
  }

  // --- VOUCHER CRUD ---

  async createVoucher(data: {
    vouchername: string;
    description?: string;
    discounttype: DiscountType;
    discountvalue: number;
    maxusage: number;
    maxusageperuser?: number;
    startdate: string;
    enddate: string;
    status?: VoucherStatus;
  }) {
    if (!data.vouchername || !data.discounttype || data.discountvalue == null || data.maxusage == null) {
      throw new Error("vouchername, discounttype, discountvalue, and maxusage are required to create a voucher");
    }

    const discountVal = Number(data.discountvalue);
    const maxUsage = Number(data.maxusage);
    const maxPerUser = data.maxusageperuser ? Number(data.maxusageperuser) : 1;

    if (isNaN(discountVal) || discountVal <= 0) {
      throw new Error("discountvalue must be greater than 0");
    }

    if (data.discounttype === "Percentage" && discountVal > 100) {
      throw new Error("Percentage discountvalue cannot exceed 100%");
    }

    if (isNaN(maxUsage) || maxUsage <= 0) {
      throw new Error("maxusage must be greater than 0");
    }

    if (isNaN(maxPerUser) || maxPerUser <= 0) {
      throw new Error("maxusageperuser must be greater than 0");
    }

    if (maxPerUser > maxUsage) {
      throw new Error("maxusageperuser cannot be greater than global maxusage");
    }

    const startDate = new Date(data.startdate || Date.now());
    const endDate = new Date(data.enddate || Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format for voucher startdate or enddate");
    }

    if (startDate >= endDate) {
      throw new Error("Voucher startdate must be strictly before enddate");
    }

    return await adminRepository.createVoucher({
      vouchername: data.vouchername.trim(),
      description: data.description,
      discounttype: data.discounttype,
      discountvalue: discountVal,
      maxusage: maxUsage,
      maxusageperuser: maxPerUser,
      startdate: startDate,
      enddate: endDate,
      status: data.status,
    });
  }

  async getAllVouchers() {
    return await adminRepository.findAllVouchers();
  }

  async updateVoucher(voucherid: string, data: any) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided to update voucher");
    }

    const updateData: any = {};
    if (data.vouchername) updateData.vouchername = data.vouchername.trim();
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discounttype) updateData.discounttype = data.discounttype;

    if (data.discountvalue != null) {
      const discountVal = Number(data.discountvalue);
      if (isNaN(discountVal) || discountVal <= 0) throw new Error("discountvalue must be greater than 0");
      updateData.discountvalue = discountVal;
    }

    if (data.maxusage != null) {
      const maxUsage = Number(data.maxusage);
      if (isNaN(maxUsage) || maxUsage <= 0) throw new Error("maxusage must be greater than 0");
      updateData.maxusage = maxUsage;
    }

    if (data.maxusageperuser != null) {
      const maxPerUser = Number(data.maxusageperuser);
      if (isNaN(maxPerUser) || maxPerUser <= 0) throw new Error("maxusageperuser must be greater than 0");
      updateData.maxusageperuser = maxPerUser;
    }

    if (data.startdate) {
      const sd = new Date(data.startdate);
      if (isNaN(sd.getTime())) throw new Error("Invalid date format for startdate");
      updateData.startdate = sd;
    }

    if (data.enddate) {
      const ed = new Date(data.enddate);
      if (isNaN(ed.getTime())) throw new Error("Invalid date format for enddate");
      updateData.enddate = ed;
    }

    if (updateData.startdate && updateData.enddate && updateData.startdate >= updateData.enddate) {
      throw new Error("Voucher startdate must be strictly before enddate");
    }

    if (data.status) updateData.status = data.status;

    return await adminRepository.updateVoucher(voucherid, updateData);
  }

  async deleteVoucher(voucherid: string) {
    return await adminRepository.deleteVoucher(voucherid);
  }

  // --- BOOKING STATUS OVERRIDE ---

  async updateBookingStatus(bookingid: string, status: BookingStatus) {
    if (!status) {
      throw new Error("status is required to update booking status");
    }

    return await adminRepository.updateBookingStatusWithInventory(
      bookingid,
      status
    );
  }
}

export const adminService = new AdminService();
