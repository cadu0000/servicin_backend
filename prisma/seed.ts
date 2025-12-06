import { seedCategories } from "./seeds/categories.seed";
import { seedCountries } from "./seeds/countries.seed";
import { seedStates } from "./seeds/states.seed";
import { seedCities } from "./seeds/cities.seed";
import { seedUsers } from "./seeds/users.seed";
import { seedServices } from "./seeds/services.seed";

async function seed() {
  await seedCountries();
  await seedStates();
  await seedCities();
  await seedCategories();
  await seedUsers();
  await seedServices();
}

seed().then(() => {
  console.log("Seeding completed successfully.");
});
