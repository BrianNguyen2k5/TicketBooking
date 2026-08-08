import { authService } from "../services/auth.service";
import { Request, Response } from "express";
import { sendSuccess, sendError } from "../utils/response";

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return sendError(res, "Email and password are required", 400);
      }

      const result = await authService.login(email, password);

      return sendSuccess(res, result, "Login successful", 200);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }
}

export const authController = new AuthController();
