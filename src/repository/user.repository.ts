import { SignUpUserDTO } from "../schemas/user.schema";
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

  async signup(signUpUserDTO: SignUpUserDTO) {
    const { email, password, photoUrl, userType, address, contact } =
      signUpUserDTO;

    const user = await prisma.user.create({
      select: {
        id: true,
        email: true,
        photoUrl: true,
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
            data: contact,
          },
        },
      },
    });

    return user;
  }
}
