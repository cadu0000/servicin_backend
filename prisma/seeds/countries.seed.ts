import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCountries() {
  console.log("🌱 Starting countries seed...");

  try {
    const existingCountry = await prisma.country.findUnique({
      where: { name: "Brasil" },
    });

    if (existingCountry) {
      console.log("✅ Brasil already exists, skipping...");
      return;
    }

    await prisma.country.create({
      data: { name: "Brasil" },
    });

    console.log("✅ Countries seed completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding countries:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
