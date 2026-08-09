import { concertRepository } from "../repositories/concert.repository";

export class BrowseService {
  async getAllConcerts() {
    const concertList = await concertRepository.findAllConcerts();

    if (!concertList) {
      throw new Error("Concert list not found");
    }

    return concertList;
  }

  async getAllConcertTickets(concertId: string) {
    const concertInfo =
      await concertRepository.findConcertTicketsById(concertId);

    if (!concertInfo) {
      throw new Error("Concert not found");
    }

    return concertInfo;
  }
}

export const browseService = new BrowseService();
