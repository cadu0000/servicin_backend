-- AlterTable
ALTER TABLE "service_provider_availabilities" ADD COLUMN     "break_end" TEXT,
ADD COLUMN     "break_start" TEXT,
ADD COLUMN     "slot_duration" INTEGER NOT NULL DEFAULT 30;
