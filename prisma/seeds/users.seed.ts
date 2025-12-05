import { PrismaClient, UserRole, ContactType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import usersData from "./users.json";
import { hashPassword } from "../../src/utils/password";

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log("🌱 Starting users seed...");

  try {
    await prisma.user.deleteMany();

    for (const userData of usersData) {
      const hashedPassword = await hashPassword(userData.password);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          userType: userData.userType as UserRole,
          photoUrl: faker.image.avatar(),
          address: {
            createMany: {
              data: userData.address,
            },
          },
          contacts: {
            createMany: {
              data: userData.contacts.map((contact) => ({
                ...contact,
                type: contact.type as ContactType,
              })),
            },
          },
        },
      });

      if (userData.userType === "INDIVIDUAL" && userData.individual) {
        await prisma.individual.create({
          data: {
            userId: user.id,
            cpf: userData.individual.cpf,
            fullName: userData.individual.fullName,
            birthDate: userData.individual.birthDate
              ? new Date(userData.individual.birthDate)
              : null,
          },
        });
      } else if (userData.userType === "COMPANY" && userData.company) {
        await prisma.company.create({
          data: {
            userId: user.id,
            cnpj: userData.company.cnpj,
            corporateName: userData.company.corporateName,
            tradeName: userData.company.tradeName,
          },
        });
      }

      if ((userData as any).isServiceProvider) {
        await prisma.serviceProvider.create({
          data: {
            userId: user.id,
          },
        });
      }
    }
  } catch (error) {
    console.error("❌ Error seeding users:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
