/*
  Warnings:

  - You are about to drop the column `provider_id` on the `review` table. All the data in the column will be lost.
  - Added the required column `service_id` to the `review` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."review" DROP CONSTRAINT "review_provider_id_fkey";

-- AlterTable
ALTER TABLE "review" DROP COLUMN "provider_id",
ADD COLUMN     "service_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
