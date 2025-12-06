-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED');

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
