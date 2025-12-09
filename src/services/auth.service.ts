import { AuthRepository } from "../repository/auth.repository";
import { AppointmentRepository } from "../repository/appointment.repository";
import { NotificationService } from "./notification.service";
import {
  SignupCompanyUserDTO,
  SignupIndividualUserDTO,
  SignupUserDTO,
} from "../schemas/auth.schema";
import { generateToken } from "../utils/jwt";
import { hashPassword } from "../utils/password";

export class AuthService {
  constructor(
    private readonly userRepository: AuthRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly notificationService: NotificationService
  ) {}

  async signup(signupUserDTO: SignupUserDTO) {
    const { email, userType } = signupUserDTO;

    const emailAlreadyExists = await this.userRepository.findByEmail(email);

    if (emailAlreadyExists) {
      throw new Error("Email já está em uso");
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
      throw new Error("CPF já está em uso");
    }

    const hashedPassword = await hashPassword(password);

    const individualUser = await this.userRepository.signup({
      ...signupIndividualUserDTO,
      password: hashedPassword,
    });

    if (!individualUser) {
      throw new Error("Erro ao criar usuário individual");
    }

    const token = generateToken({
      payload: {
        sub: individualUser.id,
        email: individualUser.email,
      },
      secret: process.env.JWT_SECRET!,
    });

    if (!token) {
      throw new Error("Erro ao gerar token de autenticação");
    }

    await this.notificationService.notifyWelcome(individualUser.id);

    return token;
  }

  private async signupCompany(signupCompanyUserDTO: SignupCompanyUserDTO) {
    const { cnpj, password } = signupCompanyUserDTO;

    const cnpjAlreadyExists = await this.userRepository.findCompanyByCNPJ(cnpj);

    if (cnpjAlreadyExists) {
      throw new Error("CNPJ já está em uso");
    }

    const hashedPassword = await hashPassword(password);

    const companyUser = await this.userRepository.signup({
      ...signupCompanyUserDTO,
      password: hashedPassword,
    });

    if (!companyUser) {
      throw new Error("Erro ao criar usuário empresa");
    }

    const token = generateToken({
      payload: {
        sub: companyUser.id,
        email: companyUser.email,
      },
      secret: process.env.JWT_SECRET!,
    });

    if (!token) {
      throw new Error("Erro ao gerar token de autenticação");
    }

    await this.notificationService.notifyWelcome(companyUser.id);

    return token;
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Email ou senha inválidos");
    }

    const isPasswordValid = await this.userRepository.verifyPassword(
      user.id,
      password
    );
    if (!isPasswordValid) {
      throw new Error("Email ou senha inválidos");
    }

    const token = generateToken({
      payload: { sub: user.id, email: user.email },
      secret: process.env.JWT_SECRET!,
    });

    return token;
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findUserWithDetails(userId);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const { serviceProvider, ...userInfo } = user;

    const isProvider = await this.userRepository.isServiceProvider(userId);
    const role = isProvider ? "PROVIDER" : "CUSTOMER";

    return { ...userInfo, role };
  }

  async deleteAccount(userId: string): Promise<void> {
    const isProvider = await this.userRepository.isServiceProvider(userId);

    if (isProvider) {
      await this.appointmentRepository.cancelFutureAppointmentsForProvider(
        userId
      );
    }

    await this.userRepository.deleteAccount(userId);
  }
}
