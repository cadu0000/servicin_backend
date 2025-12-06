import { PrismaClient } from "@prisma/client";
import { cleanCountries } from "./seeds/countries.seed";
import { cleanStates } from "./seeds/states.seed";
import { cleanCities } from "./seeds/cities.seed";
import { cleanServices } from "./seeds/services.seed";
import { cleanUsers } from "./seeds/users.seed";
import { cleanAppointments } from "./seeds/appointments.seed";
import { cleanAvailabilities } from "./seeds/availabilities.seed";
import { cleanCategories } from "./seeds/categories.seed";

const prisma = new PrismaClient();

async function cleanAddresses() {
  console.log("🧹 Cleaning addresses...");

  try {
    await prisma.address.deleteMany();
    console.log("✅ Addresses cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning addresses:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

async function clean() {
  console.log("🧹 Starting cleanup of countries, states and cities...");
  await cleanAppointments();
  await cleanAvailabilities();
  await cleanServices();
  await cleanUsers();
  await cleanAddresses();
  await cleanCities();
  await cleanStates();
  await cleanCountries();
  await cleanCategories();
  console.log("✅ Cleanup completed successfully.");
}

clean()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n🎉 All cleanup operations completed successfully.");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
