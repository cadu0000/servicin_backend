import { UserRepository } from "../repository/user.repository";
import {
  CreateServiceProviderDTO,
  SignupCompanyUserDTO,
  SignupIndividualUserDTO,
  SignupUserDTO,
} from "../schemas/user.schema";
import { generateToken } from "../utils/jwt";
import { hashPassword } from "../utils/password";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async signup(signupUserDTO: SignupUserDTO) {
    const { email, userType } = signupUserDTO;

    const emailAlreadyExists = await this.userRepository.findByEmail(email);

    if (emailAlreadyExists) {
      throw new Error("Email already in use");
    }

    if (userType === "INDIVIDUAL") {
      return this.signupIndividual(signupUserDTO);
    }

    return this.signupCompany(signupUserDTO);
  }

  private async signupIndividual(
    signupIndividualUserDTO: SignupIndividualUserDTO
  ) {
    const { cpf, password } = signupIndividualUserDTO;

    const cpfAlreadyExists = await this.userRepository.findIndividualByCPF(cpf);

    if (cpfAlreadyExists) {
      throw new Error("CPF already in use");
    }

    const hashedPassword = await hashPassword(password);

    const { user, individualUser } = await this.userRepository.signup({
      ...signupIndividualUserDTO,
      password: hashedPassword,
    });

    if (!individualUser) {
      throw new Error("Error creating individual user");
    }

    const token = generateToken({
      payload: {
        sub: user.id,
        email: user.email,
      },
      secret: process.env.JWT_SECRET!,
    });

    if (!token) {
      throw new Error("Error generating authentication token");
    }

    return {
      token,
      user: {
        id: user.id,
        cpf: individualUser.cpf,
        fullName: individualUser.fullName,
        birthDate: individualUser.birthDate?.toISOString() ?? null,
        email: user.email,
        photoUrl: user.photoUrl,
        userType: user.userType,
        address: user.address.map((addr) => ({
          number: addr.number,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          neighborhood: addr.neighborhood,
          zipCode: addr.zipCode,
          country: addr.country,
        })),
        contacts: user.contacts.map((contact) => ({
          type: contact.type,
          value: contact.value,
        })),
      },
    };
  }

  private async signupCompany(signupCompanyUserDTO: SignupCompanyUserDTO) {
    const { cnpj, password } = signupCompanyUserDTO;

    const cnpjAlreadyExists = await this.userRepository.findCompanyByCNPJ(cnpj);

    if (cnpjAlreadyExists) {
      throw new Error("CNPJ already in use");
    }

    const hashedPassword = await hashPassword(password);

    const { user, companyUser } = await this.userRepository.signup({
      ...signupCompanyUserDTO,
      password: hashedPassword,
    });

    if (!companyUser) {
      throw new Error("Error creating company user");
    }

    const token = generateToken({
      payload: {
        sub: user.id,
        email: user.email,
      },
      secret: process.env.JWT_SECRET!,
    });

    if (!token) {
      throw new Error("Error generating authentication token");
    }

    return {
      token,
      user: {
        id: user.id,
        cnpj: companyUser.cnpj,
        corporateName: companyUser.corporateName,
        tradeName: companyUser.tradeName,
        email: user.email,
        photoUrl: user.photoUrl,
        userType: user.userType,
        address: user.address.map((addr) => ({
          number: addr.number,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          neighborhood: addr.neighborhood,
          zipCode: addr.zipCode,
          country: addr.country,
        })),
        contacts: user.contacts.map((contact) => ({
          type: contact.type,
          value: contact.value,
        })),
      },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await this.userRepository.verifyPassword(
      user.id,
      password
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken({
      payload: { sub: user.id, email: user.email },
      secret: process.env.JWT_SECRET!,
    });

    return token;
  }

  async createServiceProvider(params: CreateServiceProviderDTO) {
    const { userId } = params;

    const userAlreadyExists = await this.userRepository.findById(userId);

    if (!userAlreadyExists) {
      throw new Error("User not found");
    }

    const serviceProviderAlreadyExists =
      await this.userRepository.findServiceProviderByUserId(userId);

    if (serviceProviderAlreadyExists) {
      throw new Error("Service provider already exists for this user");
    }

    return await this.userRepository.createServiceProvider(params);
  }
}
