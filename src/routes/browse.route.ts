import { browseController } from "../controllers/browse.controller";
import { Router } from "express";

const router = Router();

// Customer
router.get("/", (req, res) => browseController.getAllConcerts(req, res));
router.get("/:concertId", (req, res) =>
  browseController.getConcertTicketsById(req, res),
);

export default router;
