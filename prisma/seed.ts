import { cleanCategories, seedCategories } from "./seeds/categories.seed";
import { seedCountries } from "./seeds/countries.seed";
import { seedStates } from "./seeds/states.seed";
import { seedCities } from "./seeds/cities.seed";
import { cleanUsers, seedUsers } from "./seeds/users.seed";
import { cleanServices, seedServices } from "./seeds/services.seed";
import {
  cleanAvailabilities,
  seedAvailabilities,
} from "./seeds/availabilities.seed";
import { cleanAppointments, seedAppointments } from "./seeds/appointments.seed";

async function seed() {
  console.log("🧹 Starting cleanup...");
  await cleanAppointments();
  await cleanAvailabilities();
  await cleanServices();
  await cleanUsers();
  await cleanCategories();
  console.log("✅ Cleanup completed.\n");

  console.log("🌱 Starting seeding...");
  await seedCountries();
  await seedStates();
  await seedCities();
  await seedCategories();
  await seedUsers();
  await seedServices();
  await seedAvailabilities();
  await seedAppointments();
  console.log("✅ Seeding completed successfully.");
}

seed().then(() => {
  console.log("\n🎉 All operations completed successfully.");
});
