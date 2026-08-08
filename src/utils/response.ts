import { Response } from "express";

// Standardized Success Response
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = "Success",
  statusCode: number = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

// Standardized Error Response
export const sendError = (
  res: Response,
  message: string = "Internal Server Error",
  statusCode: number = 500,
  errors: any = null,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};
