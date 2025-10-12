import { generateToken, hashPassword } from "../lib";
import { UserRepository } from "../repository/user.repository";
import { SignUpIndividualUserDTO, SignUpUserDTO } from "../schemas/user.schema";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(signUpUserDTO: SignUpUserDTO) {
    const { email, password } = signUpUserDTO;

    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new Error("Email already in use");
    }

    const hashedPassword = await hashPassword(password);

    const user = await this.userRepository.signup({
      ...signUpUserDTO,
      password: hashedPassword,
    });

    return {
      userId: user.id,
    };
  }

  async signupIndividual(signUpIndividualUserDTO: SignUpIndividualUserDTO) {
    const { cpf, userId } = signUpIndividualUserDTO;

    const findUserById = await this.userRepository.findById(userId);

    if (!findUserById) {
      throw new Error("User not found");
    }

    const individualUserAlreadyExists =
      await this.userRepository.findIndividualByCPF(cpf);

    if (individualUserAlreadyExists) {
      throw new Error("CPF already in use");
    }

    const individualUser = await this.userRepository.signupIndividual(
      signUpIndividualUserDTO
    );

    const token = generateToken({
      payload: {
        sub: individualUser.user.id,
        email: individualUser.user.email,
      },
      secret: process.env.JWT_SECRET!,
    });

    if (!token) {
      throw new Error("Error generating authentication token");
    }

    return {
      token,
      user: {
        id: individualUser.user.id,
        cpf: individualUser.cpf,
        fullName: individualUser.fullName,
        birthDate: individualUser.birthDate?.toISOString(),
        email: individualUser.user.email,
        photoUrl: individualUser.user.photoUrl,
        userType: individualUser.user.userType,
        address: individualUser.user.address.map((addr) => ({
          number: addr.number,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zipCode: addr.zipCode,
          neighborhood: addr.neighborhood,
          country: addr.country,
        })),
        contacts: individualUser.user.contacts.map((contact) => ({
          type: contact.type,
          value: contact.value,
        })),
      },
    };
  }
}
