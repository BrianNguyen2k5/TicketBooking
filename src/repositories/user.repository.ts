import { prisma } from "../config/db";

export class UserRepository {
  // Find a user by email
  async findByEmail(email: string) {
    return await prisma.users.findUnique({
      where: { email },
    });
  }

  // Find a user by ID
  async findById(userid: string) {
    return await prisma.users.findUnique({
      where: { userid },
    });
  }
}

export const userRepository = new UserRepository();
