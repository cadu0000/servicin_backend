import { PrismaClient } from "@prisma/client";
import categoriesData from "./categories.json";

const prisma = new PrismaClient();

export async function cleanCategories() {
  console.log("🧹 Cleaning categories...");

  try {
    await prisma.category.deleteMany();
    console.log("✅ Categories cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning categories:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedCategories() {
  console.log("🌱 Starting categories seed...");

  try {
    await prisma.category.createMany({ data: categoriesData });
    console.log("✅ Categories seed completed successfully.");
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
