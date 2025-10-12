import {
  SignUpCompanyUserDTO,
  SignUpIndividualUserDTO,
  SignUpUserDTO,
} from "../schemas/user.schema";
import { prisma } from "../lib/prisma";

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

  async signup(signUpUserDTO: SignUpUserDTO) {
    const { email, password, photoUrl, userType, address, contact } =
      signUpUserDTO;

    const user = await prisma.user.create({
      select: {
        id: true,
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
            data: contact,
          },
        },
      },
    });

    return user;
  }

  async signupIndividual(signUpIndividualUserDTO: SignUpIndividualUserDTO) {
    const { cpf, fullName, birthDate, userId } = signUpIndividualUserDTO;

    const individualUser = await prisma.individual.create({
      select: {
        cpf: true,
        fullName: true,
        birthDate: true,
        user: {
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
        },
      },
      data: {
        cpf,
        fullName,
        birthDate,
        userId,
      },
    });

    return individualUser;
  }

  async signupCompany(signUpCompanyUserDTO: SignUpCompanyUserDTO) {
    const { cnpj, corporateName, tradeName, userId } = signUpCompanyUserDTO;

    const companyUser = await prisma.company.create({
      select: {
        cnpj: true,
        corporateName: true,
        tradeName: true,
        user: {
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
        },
      },
      data: {
        cnpj,
        corporateName,
        tradeName,
        userId,
      },
    });

    return companyUser;
  }
}
