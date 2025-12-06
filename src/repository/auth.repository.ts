import { SignupUserDTO } from "../schemas/auth.schema";
import { prisma } from "../lib/prisma";
import { verifyPassword } from "../utils/password";

export class AuthRepository {
  async findByEmail(email: string) {
    const userAlreadyExists = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });

    return userAlreadyExists;
  }

  async findById(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
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

    const country = await prisma.country.findUnique({
      where: { id: address.countryId },
    });

    if (!country) {
      throw new Error("Country not found");
    }

    const state = await prisma.state.findUnique({
      where: { id: address.stateId },
    });

    if (!state) {
      throw new Error("State not found");
    }

    if (state.countryId !== address.countryId) {
      throw new Error("State does not belong to the specified country");
    }

    const city = await prisma.city.findFirst({
      where: {
        id: address.cityId,
        stateId: address.stateId,
      },
    });

    if (!city) {
      throw new Error("City not found");
    }

    if (city.stateId !== address.stateId) {
      throw new Error("City does not belong to the specified state");
    }

    const createdAddress = await prisma.address.create({
      data: {
        countryId: address.countryId,
        stateId: address.stateId,
        cityId: address.cityId,
        neighborhood: address.neighborhood,
        street: address.street,
        zipCode: address.zipCode,
        number: address.number,
      },
    });

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
        addressId: createdAddress.id,
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
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: { password: true },
    });

    if (!user) return false;

    return await verifyPassword(password, user.password);
  }

  async findUserWithDetails(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        userType: true,
        photoUrl: true,
        createdAt: true,
        address: {
          select: {
            id: true,
            country: {
              select: {
                name: true,
              },
            },
            state: {
              select: {
                name: true,
              },
            },
            city: {
              select: {
                name: true,
              },
            },
            neighborhood: true,
            street: true,
            zipCode: true,
            number: true,
          },
        },
        contacts: {
          select: {
            id: true,
            type: true,
            value: true,
          },
        },
        individual: {
          select: {
            fullName: true,
            cpf: true,
            birthDate: true,
          },
        },
        company: {
          select: {
            corporateName: true,
            cnpj: true,
            tradeName: true,
          },
        },
      },
    });

    return user;
  }

  async deleteAccount(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async isServiceProvider(userId: string): Promise<boolean> {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: { userId },
      select: { userId: true },
    });
    return !!serviceProvider;
  }
}
