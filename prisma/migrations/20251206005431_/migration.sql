/*
  Warnings:

  - You are about to drop the column `scheduledAt` on the `appointments` table. All the data in the column will be lost.
  - Added the required column `scheduledEndTime` to the `appointments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledStartTime` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "scheduledAt",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "scheduledEndTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "scheduledStartTime" TIMESTAMP(3) NOT NULL;
