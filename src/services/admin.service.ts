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
    if (!data.concertname || !data.starttime || !data.startdate) {
      throw new Error("concertname, starttime, and startdate are required to create a concert");
    }

    if (!data.tickets || data.tickets.length === 0) {
      throw new Error("At least one ticket category is required to create a concert");
    }

    const formattedTickets = data.tickets.map((t) => {
      if (!t.ticketname || t.priceperticket == null || t.totalquantity == null) {
        throw new Error("Each ticket category requires ticketname, priceperticket, and totalquantity");
      }
      return {
        ticketname: t.ticketname,
        priceperticket: Number(t.priceperticket),
        totalquantity: Number(t.totalquantity),
        startdatetime: new Date(t.startdatetime || Date.now()),
        enddatetime: new Date(t.enddatetime || Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: t.status,
      };
    });

    return await adminRepository.createConcertWithTickets({
      concertname: data.concertname,
      description: data.description,
      starttime: new Date(data.starttime),
      startdate: new Date(data.startdate),
      status: data.status,
      tickets: formattedTickets,
    });
  }

  async updateConcert(concertid: string, data: any) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided to update concert");
    }

    const updateData: any = {};
    if (data.concertname) updateData.concertname = data.concertname;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.starttime) updateData.starttime = new Date(data.starttime);
    if (data.startdate) updateData.startdate = new Date(data.startdate);
    if (data.status) updateData.status = data.status;

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

    return await adminRepository.addTicketToConcert(concertid, {
      ticketname: data.ticketname,
      priceperticket: Number(data.priceperticket),
      totalquantity: Number(data.totalquantity),
      startdatetime: new Date(data.startdatetime || Date.now()),
      enddatetime: new Date(data.enddatetime || Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: data.status,
    });
  }

  async updateTicket(ticketid: string, data: any) {
    if (!data || Object.keys(data).length === 0) {
      throw new Error("At least one field must be provided to update ticket");
    }

    const updateData: any = {};
    if (data.ticketname) updateData.ticketname = data.ticketname;
    if (data.priceperticket != null) updateData.priceperticket = Number(data.priceperticket);
    if (data.totalquantity != null) updateData.totalquantity = Number(data.totalquantity);
    if (data.availablequantity != null) updateData.availablequantity = Number(data.availablequantity);
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

    return await adminRepository.createVoucher({
      vouchername: data.vouchername,
      description: data.description,
      discounttype: data.discounttype,
      discountvalue: Number(data.discountvalue),
      maxusage: Number(data.maxusage),
      maxusageperuser: data.maxusageperuser ? Number(data.maxusageperuser) : 1,
      startdate: new Date(data.startdate || Date.now()),
      enddate: new Date(data.enddate || Date.now() + 30 * 24 * 60 * 60 * 1000),
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
    if (data.vouchername) updateData.vouchername = data.vouchername;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.discounttype) updateData.discounttype = data.discounttype;
    if (data.discountvalue != null) updateData.discountvalue = Number(data.discountvalue);
    if (data.maxusage != null) updateData.maxusage = Number(data.maxusage);
    if (data.maxusageperuser != null) updateData.maxusageperuser = Number(data.maxusageperuser);
    if (data.startdate) updateData.startdate = new Date(data.startdate);
    if (data.enddate) updateData.enddate = new Date(data.enddate);
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
