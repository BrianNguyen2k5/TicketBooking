import jwt from "jsonwebtoken";

export interface JwtPayload {
  userid: string;
  email: string;
  role: "Customer" | "Operator" | "Admin";
}

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_geekup_key_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// Sign a new JWT Token
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

// Verify an existing JWT Token
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
