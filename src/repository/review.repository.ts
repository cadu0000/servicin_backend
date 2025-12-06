import { prisma } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

type CreateReviewData = {
  serviceId: string;
  clientId: string;
  rating: number;
  comment?: string;
};

export class ReviewRepository {
  async create(createReviewData: CreateReviewData) {
    const { serviceId, clientId, rating, comment } = createReviewData;

    const review = await prisma.review.create({
      data: {
        serviceId,
        clientId,
        rating: new Decimal(rating),
        comment: comment || null,
      },
      select: {
        id: true,
        serviceId: true,
        clientId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    return review;
  }

  async findReviewByAppointmentAndClient(
    appointmentId: string,
    clientId: string
  ) {
    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        clientId: true,
        serviceId: true,
      },
    });

    if (!appointment) {
      return null;
    }

    const review = await prisma.review.findFirst({
      where: {
        serviceId: appointment.serviceId,
        clientId: appointment.clientId,
      },
    });

    return review;
  }
}
