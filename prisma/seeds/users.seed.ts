import { PrismaClient, UserRole, ContactType } from "@prisma/client";
import { faker } from "@faker-js/faker";
import usersData from "./users.json";
import { hashPassword } from "../../src/utils/password";

const prisma = new PrismaClient();

export async function cleanUsers() {
  console.log("🧹 Cleaning users...");

  try {
    await prisma.user.deleteMany();
    console.log("✅ Users cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning users:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedUsers() {
  console.log("🌱 Starting users seed...");

  try {

    for (const userData of usersData) {
      const hashedPassword = await hashPassword(userData.password);
      const addressData = userData.address[0];

      let country = await prisma.country.findUnique({
        where: { name: addressData.country },
      });

      if (!country) {
        country = await prisma.country.create({
          data: { name: addressData.country },
        });
      }

      let state = await prisma.state.findUnique({
        where: { name: addressData.state },
      });

      if (!state) {
        state = await prisma.state.create({
          data: {
            name: addressData.state,
            countryId: country.id,
          },
        });
      }

      let city = await prisma.city.findFirst({
        where: {
          name: addressData.city,
          stateId: state.id,
        },
      });

      if (!city) {
        city = await prisma.city.create({
          data: {
            name: addressData.city,
            stateId: state.id,
          },
        });
      }

      const address = await prisma.address.create({
        data: {
          countryId: country.id,
          stateId: state.id,
          cityId: city.id,
          neighborhood: addressData.neighborhood,
          street: addressData.street,
          zipCode: addressData.zipCode,
          number: addressData.number,
        },
      });

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          userType: userData.userType as UserRole,
          photoUrl: faker.image.avatar(),
          addressId: address.id,
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
        const isFirstProvider = userData.email === "carlos.provedor@email.com";
        await prisma.serviceProvider.create({
          data: {
            userId: user.id,
            autoAcceptAppointments: isFirstProvider,
          },
        });
      }
    }

    console.log("✅ Users seed completed successfully.");
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
