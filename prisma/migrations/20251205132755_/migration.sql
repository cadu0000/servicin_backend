-- DropForeignKey
ALTER TABLE "public"."service_availabilities" DROP CONSTRAINT "service_availabilities_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."services" DROP CONSTRAINT "services_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."services" DROP CONSTRAINT "services_providerId_fkey";

-- AddForeignKey
ALTER TABLE "service_availabilities" ADD CONSTRAINT "service_availabilities_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_providers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
