import { prisma } from "../lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

type CreateReviewData = {
  serviceId: string;
  clientId: string;
  rating: number;
  comment?: string;
  appointmentId: string;
};

export class ReviewRepository {
  async create(createReviewData: CreateReviewData) {
    const { serviceId, clientId, rating, comment, appointmentId } =
      createReviewData;

    const review = await prisma.review.create({
      data: {
        serviceId,
        clientId,
        appointmentId,
        rating: new Decimal(rating),
        comment: comment || null,
      },
      select: {
        id: true,
        serviceId: true,
        clientId: true,
        appointmentId: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    });

    return review;
  }

  async findReviewByAppointment(appointmentId: string) {
    const review = await prisma.review.findFirst({
      where: {
        appointmentId,
      },
    });

    return review;
  }
}
