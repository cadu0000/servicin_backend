import { PrismaClient } from "@prisma/client";
import { AppointmentStatus, PaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanAppointments() {
  console.log("🧹 Cleaning appointments...");

  try {
    await prisma.appointment.deleteMany();
    console.log("✅ Appointments cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning appointments:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedAppointments() {
  console.log("🌱 Starting appointments seed...");

  try {

    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true,
        providerId: true,
        price: true,
        availabilities: {
          select: {
            dayOfWeek: true,
            slotDuration: true,
          },
        },
      },
    });

    const clients = await prisma.user.findMany({
      where: {
        serviceProvider: null,
      },
      select: {
        id: true,
        email: true,
      },
      take: 3,
    });

    if (services.length === 0 || clients.length === 0) {
      console.warn(
        "⚠️ No services or clients found. Skipping appointments seed."
      );
      return;
    }

    const now = new Date();
    const appointments = [];

    for (let i = 0; i < services.length && i < clients.length; i++) {
      const service = services[i];
      const client = clients[i];

      const dayOfWeek = (now.getDay() + 1) % 7 || 7;
      const availability = service.availabilities.find(
        (av) => av.dayOfWeek === dayOfWeek
      );
      const slotDuration = availability?.slotDuration || 30;

      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9 + i, 0, 0, 0);
      const tomorrowEnd = new Date(tomorrow);
      tomorrowEnd.setMinutes(tomorrowEnd.getMinutes() + slotDuration);

      const dayAfterTomorrow = new Date(now);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      dayAfterTomorrow.setHours(10 + i, 30, 0, 0);
      const dayAfterTomorrowEnd = new Date(dayAfterTomorrow);
      dayAfterTomorrowEnd.setMinutes(
        dayAfterTomorrowEnd.getMinutes() + slotDuration
      );

      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(14 + i, 0, 0, 0);
      const nextWeekEnd = new Date(nextWeek);
      nextWeekEnd.setMinutes(nextWeekEnd.getMinutes() + slotDuration);

      const price = Number(service.price);

      appointments.push(
        {
          serviceId: service.id,
          clientId: client.id,
          scheduledStartTime: tomorrow,
          scheduledEndTime: tomorrowEnd,
          description: `Agendamento para ${service.name} - Primeira solicitação`,
          paymentMethod: PaymentMethod.PIX,
          price: price,
          status: AppointmentStatus.PENDING,
        },
        {
          serviceId: service.id,
          clientId: client.id,
          scheduledStartTime: dayAfterTomorrow,
          scheduledEndTime: dayAfterTomorrowEnd,
          description: `Agendamento para ${service.name} - Segunda solicitação`,
          paymentMethod: PaymentMethod.CREDIT_CARD,
          price: price,
          status: AppointmentStatus.APPROVED,
        },
        {
          serviceId: service.id,
          clientId: client.id,
          scheduledStartTime: nextWeek,
          scheduledEndTime: nextWeekEnd,
          description: `Agendamento para ${service.name} - Terceira solicitação`,
          paymentMethod: PaymentMethod.CASH,
          price: price,
          status: AppointmentStatus.PENDING,
        }
      );
    }

    if (services.length > 0 && clients.length > 0) {
      const firstService = services[0];
      const firstClient = clients[0];

      const dayOfWeek = now.getDay();
      const availability = firstService.availabilities.find(
        (av) => av.dayOfWeek === dayOfWeek
      );
      const slotDuration = availability?.slotDuration || 30;

      const todayAfternoon = new Date(now);
      todayAfternoon.setHours(15, 0, 0, 0);
      const todayAfternoonEnd = new Date(todayAfternoon);
      todayAfternoonEnd.setMinutes(todayAfternoonEnd.getMinutes() + slotDuration);

      if (todayAfternoon > now) {
        appointments.push({
          serviceId: firstService.id,
          clientId: firstClient.id,
          scheduledStartTime: todayAfternoon,
          scheduledEndTime: todayAfternoonEnd,
          description: `Agendamento para ${firstService.name} - Hoje à tarde`,
          paymentMethod: PaymentMethod.DEBIT_CARD,
          price: Number(firstService.price),
          status: AppointmentStatus.APPROVED,
        });
      }
    }

    for (const appointment of appointments) {
      await prisma.appointment.create({
        data: appointment,
      });
    }

    console.log(`✅ Created ${appointments.length} appointments.`);
    console.log("✅ Appointments seed completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding appointments:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
