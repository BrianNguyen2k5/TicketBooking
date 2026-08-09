import { prisma } from "../config/db";
import { BookingStatus } from "../generated/prisma/enums";
import { generateNextId } from "../utils/idGenerator";

export class TicketRepository {
  async findTicketById(ticketId: string) {
    const ticket = await prisma.tickets.findUnique({
      where: { ticketid: ticketId },
    });

    return ticket;
  }

  async decrementAvailableQuantity(ticketId: string, amount: number) {
    const updateRows = await prisma.$executeRaw`
      UPDATE "Tickets" 
      SET "availablequantity" = "availablequantity" - ${amount}
      WHERE "ticketid" = ${ticketId} 
        AND "availablequantity" >= ${amount}
        AND "status" = 'Available'::"TicketStatus";
    `;
    return updateRows > 0;
  }
}

export const ticketRepository = new TicketRepository();
