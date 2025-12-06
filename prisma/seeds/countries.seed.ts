import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanCountries() {
  console.log("🧹 Cleaning countries...");

  try {
    await prisma.country.deleteMany();
    console.log("✅ Countries cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning countries:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedCountries() {
  console.log("🌱 Starting countries seed...");

  try {
    const existingCountries = await prisma.country.findMany();

    if (existingCountries.length > 0) {
      console.log(
        `✅ Countries already exist (${existingCountries.length} found), skipping...`
      );
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
