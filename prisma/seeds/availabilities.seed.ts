import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedAvailabilities() {
  console.log("🌱 Starting availabilities seed...");

  try {
    await prisma.serviceAvailability.deleteMany();

    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    for (const service of services) {
      const availabilities = [
        {
          dayOfWeek: 1,
          startTime: "08:00",
          endTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          slotDuration: 30,
        },
        {
          dayOfWeek: 2,
          startTime: "08:00",
          endTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          slotDuration: 30,
        },
        {
          dayOfWeek: 3,
          startTime: "08:00",
          endTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          slotDuration: 30,
        },
        {
          dayOfWeek: 4,
          startTime: "08:00",
          endTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          slotDuration: 30,
        },
        {
          dayOfWeek: 5,
          startTime: "08:00",
          endTime: "18:00",
          breakStart: "12:00",
          breakEnd: "13:00",
          slotDuration: 30,
        },
        {
          dayOfWeek: 6,
          startTime: "08:00",
          endTime: "14:00",
          breakStart: null,
          breakEnd: null,
          slotDuration: 30,
        },
      ];

      for (const availability of availabilities) {
        await prisma.serviceAvailability.create({
          data: {
            serviceId: service.id,
            dayOfWeek: availability.dayOfWeek,
            startTime: availability.startTime,
            endTime: availability.endTime,
            breakStart: availability.breakStart,
            breakEnd: availability.breakEnd,
            slotDuration: availability.slotDuration,
          },
        });
      }

      console.log(`✅ Created availabilities for service: ${service.name}`);
    }

    console.log("✅ Availabilities seed completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding availabilities:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
