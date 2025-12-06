/*
  Warnings:

  - You are about to drop the column `service_description` on the `service_providers` table. All the data in the column will be lost.
  - You are about to drop the `provider_services` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `service_provider_availabilities` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categoryId` to the `services` table without a default value. This is not possible if the table is not empty.
  - Added the required column `providerId` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."provider_services" DROP CONSTRAINT "provider_services_category_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."provider_services" DROP CONSTRAINT "provider_services_provider_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."provider_services" DROP CONSTRAINT "provider_services_service_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."service_provider_availabilities" DROP CONSTRAINT "service_provider_availabilities_provider_id_fkey";

-- AlterTable
ALTER TABLE "service_providers" DROP COLUMN "service_description";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "categoryId" INTEGER NOT NULL,
ADD COLUMN     "providerId" UUID NOT NULL;

-- DropTable
DROP TABLE "public"."provider_services";

-- DropTable
DROP TABLE "public"."service_provider_availabilities";

-- CreateTable
CREATE TABLE "service_availabilities" (
    "id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "break_start" TEXT,
    "break_end" TEXT,
    "slot_duration" INTEGER NOT NULL DEFAULT 30,
    "serviceId" UUID,

    CONSTRAINT "service_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_availabilities_serviceId_day_of_week_key" ON "service_availabilities"("serviceId", "day_of_week");

-- AddForeignKey
ALTER TABLE "service_availabilities" ADD CONSTRAINT "service_availabilities_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "service_providers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
