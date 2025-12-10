import { PrismaClient } from "@prisma/client";
import { AppointmentStatus, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function cleanReviews() {
  console.log("🧹 Cleaning reviews...");

  try {
    await prisma.review.deleteMany();
    console.log("✅ Reviews cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning reviews:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedReviews() {
  console.log("🌱 Starting reviews seed...");

  try {
    const completedAndPaidAppointments = await prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.COMPLETED,
        paymentStatus: PaymentStatus.PAID,
      },
      select: {
        id: true,
        clientId: true,
        serviceId: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (completedAndPaidAppointments.length === 0) {
      console.warn(
        "⚠️ No completed and paid appointments found. Skipping reviews seed."
      );
      return;
    }

    console.log(
      `📋 Found ${completedAndPaidAppointments.length} completed and paid appointments.`
    );

    const reviews = [
      {
        rating: 5,
        comment: "Excelente serviço! Profissional muito competente e pontual.",
      },
      {
        rating: 4.5,
        comment: "Muito bom trabalho, recomendo!",
      },
      {
        rating: 5,
        comment: "Serviço de qualidade, superou minhas expectativas.",
      },
      {
        rating: 4,
        comment: "Bom atendimento, ficou tudo certo.",
      },
      {
        rating: 5,
        comment: "Perfeito! Vou contratar novamente.",
      },
      {
        rating: 3.5,
        comment: "Serviço razoável, mas poderia melhorar na comunicação.",
      },
      {
        rating: 4.5,
        comment: "Ótimo profissional, trabalho bem feito.",
      },
      {
        rating: 5,
        comment: "Excelente! Muito satisfeito com o resultado.",
      },
      {
        rating: 4,
        comment: "Bom serviço, recomendo.",
      },
      {
        rating: 5,
        comment: "Perfeito! Profissionalismo e qualidade.",
      },
    ];

    const createdReviews = [];
    const processedServiceClientPairs = new Set<string>();

    for (let i = 0; i < completedAndPaidAppointments.length; i++) {
      const appointment = completedAndPaidAppointments[i];
      const pairKey = `${appointment.serviceId}-${appointment.clientId}`;

      if (processedServiceClientPairs.has(pairKey)) {
        continue;
      }

      const existingReview = await prisma.review.findFirst({
        where: {
          serviceId: appointment.serviceId,
          clientId: appointment.clientId,
        },
      });

      if (existingReview) {
        processedServiceClientPairs.add(pairKey);
        continue;
      }

      const reviewData = reviews[createdReviews.length % reviews.length] as {
        rating: number;
        comment: string;
      };

      const review = await prisma.review.create({
        data: {
          serviceId: appointment.serviceId,
          clientId: appointment.clientId,
          appointmentId: appointment.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
      });

      createdReviews.push(review);
      processedServiceClientPairs.add(pairKey);
    }

    console.log(`✅ Created ${createdReviews.length} reviews.`);
    console.log("✅ Reviews seed completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding reviews:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
