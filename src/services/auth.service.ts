import { userRepository } from "../repositories/user.repository";
import { generateToken } from "../utils/jwt";

export class AuthService {
  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Invalid user mail or password");
    }

    if (user.password !== password) {
      throw new Error("Invalid user mail or password");
    }

    const token = generateToken({
      userid: user.userid,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        userid: user.userid,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export const authService = new AuthService();
