import { browseService } from "../services/browse.service";
import { sendSuccess, sendError } from "../utils/response";
import { Request, Response } from "express";

export class BrowseController {
  async getAllConcerts(req: Request, res: Response) {
    try {
      const concerts = await browseService.getAllConcerts();

      if (!concerts) {
        return sendError(res, "Unable to find any concerts", 500);
      }

      return sendSuccess(res, concerts, "Concerts retrieved successfully", 200);
    } catch (error) {
      return sendError(res, "Unable to find any concerts", 500, error);
    }
  }

  async getConcertTicketsById(req: Request, res: Response) {
    try {
      const concertId = req.params.concertId;
      const concertTickets = await browseService.getAllConcertTickets(
        concertId as string,
      );

      if (!concertTickets) {
        return sendError(res, "Unable to find concert tickets", 500);
      }

      return sendSuccess(
        res,
        concertTickets,
        "Concert tickets retrieved successfully",
        200,
      );
    } catch (error) {
      return sendError(res, "Unable to find concert tickets", 500, error);
    }
  }
}

export const browseController = new BrowseController();
