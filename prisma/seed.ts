import { seedCategories } from "./seeds/categories.seed";
import { seedUsers } from "./seeds/users.seed";
import { seedServices } from "./seeds/services.seed";

async function seed() {
  await seedCategories();
  await seedUsers();
  await seedServices();
}

seed().then(() => {
  console.log("Seeding completed successfully.");
});
