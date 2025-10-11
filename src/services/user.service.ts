import { generateToken, hashPassword } from "../lib";
import { UserRepository } from "../repository/user.repository";
import { SignUpUserDTO } from "../schemas/user.schema";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(SignUpUserDTO: SignUpUserDTO) {
    const { email, password } = SignUpUserDTO;

    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.userRepository.signup({
      ...SignUpUserDTO,
      password: hashedPassword,
    });

    const token = generateToken({
      payload: { sub: user.id, email: user.email },
      secret: process.env.JWT_SECRET!,
    });

    if (!token) {
      throw new Error("Error generating authentication token");
    }

    return { token, user };
  }
}
