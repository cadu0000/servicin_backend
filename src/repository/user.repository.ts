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
        photoUrl: true,
        userType: true,
        address: {
          select: {
            street: true,
            city: true,
            state: true,
            zipCode: true,
            neighborhood: true,
            number: true,
            country: true,
          },
        },
        contacts: {
          select: {
            type: true,
            value: true,
          },
        },
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

      const individualUser = await prisma.individual.create({
        select: {
          cpf: true,
          fullName: true,
          birthDate: true,
        },
        data: {
          cpf,
          fullName,
          birthDate,
          userId: user.id,
        },
      });

      return {
        user,
        individualUser,
      };
    }

    const { cnpj, corporateName, tradeName } = signupUserDTO;

    const companyUser = await prisma.company.create({
      select: {
        cnpj: true,
        corporateName: true,
        tradeName: true,
      },
      data: {
        cnpj,
        corporateName,
        tradeName,
        userId: user.id,
      },
    });

    return {
      user,
      companyUser,
    };
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
    const { userId, serviceDescription, averageRating } =
      createServiceProviderDTO;

    const serviceProvider = await prisma.serviceProvider.create({
      select: {
        userId: true,
      },
      data: {
        userId,
        serviceDescription,
        averageRating,
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
