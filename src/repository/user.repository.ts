import {
  CreateServiceProviderDTO,
  SignupUserDTO,
} from "../schemas/user.schema";
import { prisma } from "../lib/prisma";
import { verifyPassword } from "../utils/password";

export class UserRepository {
  async findByEmail(email: string) {
    const userAlreadyExists = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    return userAlreadyExists;
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    return user;
  }

  async findIndividualByCPF(cpf: string) {
    const individualUserAlreadyExists = await prisma.individual.findUnique({
      where: {
        cpf,
      },
    });

    return individualUserAlreadyExists;
  }

  async findCompanyByCNPJ(cnpj: string) {
    const companyUserAlreadyExists = await prisma.company.findUnique({
      where: {
        cnpj,
      },
    });

    return companyUserAlreadyExists;
  }

  async signup(signupUserDTO: SignupUserDTO) {
    const { email, password, photoUrl, userType, address, contacts } =
      signupUserDTO;

    const user = await prisma.user.create({
      select: {
        id: true,
        email: true,
      },
      data: {
        email,
        password,
        photoUrl,
        userType,
        address: {
          createMany: {
            data: address,
          },
        },
        contacts: {
          createMany: {
            data: contacts,
          },
        },
      },
    });

    if (userType === "INDIVIDUAL") {
      const { cpf, fullName, birthDate } = signupUserDTO;

      await prisma.individual.create({
        data: {
          cpf,
          fullName,
          birthDate,
          userId: user.id,
        },
      });
    } else {
      const { cnpj, corporateName, tradeName } = signupUserDTO;

      await prisma.company.create({
        data: {
          cnpj,
          corporateName,
          tradeName,
          userId: user.id,
        },
      });
    }

    return user;
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true },
    });

    if (!user) return false;

    return await verifyPassword(password, user.password);
  }

  async createServiceProvider(
    createServiceProviderDTO: CreateServiceProviderDTO
  ) {
    const { userId, serviceDescription } =
      createServiceProviderDTO;

    const serviceProvider = await prisma.serviceProvider.create({
      select: {
        userId: true,
      },
      data: {
        userId,
        serviceDescription,
      },
    });

    return serviceProvider;
  }

  async findServiceProviderByUserId(userId: string) {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: {
        userId,
      },
    });

    return serviceProvider;
  }
}
