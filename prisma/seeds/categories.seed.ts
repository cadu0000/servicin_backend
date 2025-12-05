import { PrismaClient } from "@prisma/client";
import categoriesData from "./categories.json";

const prisma = new PrismaClient();

export async function seedCategories() {
  console.log("🌱 Starting categories seed...");

  try {
    await prisma.category.deleteMany();

    await prisma.category.createMany({ data: categoriesData });
  } catch (error) {
    console.error("❌ Error seeding categories:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
