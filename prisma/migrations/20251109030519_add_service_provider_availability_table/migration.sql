-- CreateTable
CREATE TABLE "service_provider_availabilities" (
    "id" UUID NOT NULL,
    "provider_id" UUID NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "service_provider_availabilities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_provider_availabilities_provider_id_day_of_week_key" ON "service_provider_availabilities"("provider_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "service_provider_availabilities" ADD CONSTRAINT "service_provider_availabilities_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "service_providers"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
