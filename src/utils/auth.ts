import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { sendError } from "../utils/response";

// Extend Express Request interface to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Middleware: Authenticate Bearer Token from Authorization Header
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Access token is missing or invalid", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", 401);
  }
};

// Middleware: Restrict access based on User Role (e.g. Customer, Operator, Admin)
export const authorizeRole = (
  ...allowedRoles: Array<"Customer" | "Operator" | "Admin">
) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Unauthenticated", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not allowed to perform this action`,
        403,
      );
    }

    next();
  };
};
