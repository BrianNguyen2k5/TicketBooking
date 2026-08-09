import { prisma } from "../config/db";

export class ConcertRepository {
  async findAllConcerts() {
    const concertList = await prisma.concerts.findMany({
      orderBy: { startdate: "desc" },
    });
    return concertList;
  }

  async findConcertTicketsById(concertId: string) {
    const concertInfo = await prisma.concerts.findUnique({
      where: { concertid: concertId },
      select: {
        concertname: true,
        Tickets: true,
      },
    });
    return concertInfo;
  }
}

export const concertRepository = new ConcertRepository();
