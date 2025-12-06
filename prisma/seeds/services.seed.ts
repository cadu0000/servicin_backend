import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
import servicesData from "./services.json";

const prisma = new PrismaClient();

export async function cleanServices() {
  console.log("🧹 Cleaning services...");

  try {
    await prisma.service.deleteMany();
    console.log("✅ Services cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning services:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedServices() {
  console.log("🌱 Starting services seed...");

  try {

    for (const serviceData of servicesData) {
      const provider = await prisma.user.findUnique({
        where: { email: serviceData.providerEmail },
        include: { serviceProvider: true },
      });

      if (!provider || !provider.serviceProvider) {
        console.warn(
          `⚠️ Provider not found or is not a service provider: ${serviceData.providerEmail}`
        );
        continue;
      }

      const category = await prisma.category.findUnique({
        where: { name: serviceData.categoryName },
      });

      if (!category) {
        console.warn(`⚠️ Category not found: ${serviceData.categoryName}`);
        continue;
      }

      const photoUrl = faker.helpers.maybe(
        () => {
          const size = faker.number.int({ min: 720, max: 1080 });
          return `https://picsum.photos/${size}/${size}`;
        },
        {
          probability: 0.7,
        }
      );

      const service = await prisma.service.create({
        data: {
          name: serviceData.name,
          description: serviceData.description,
          price: serviceData.price,
          providerId: provider.id,
          categoryId: category.id,
          addressId: provider.addressId,
          photos: photoUrl
            ? {
                create: {
                  photoUrl,
                },
              }
            : undefined,
        },
      });
    }

    console.log("✅ Services seed completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding services:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
