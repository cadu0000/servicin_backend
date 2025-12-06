import { ReviewRepository } from "../repository/review.repository";
import { AppointmentRepository } from "../repository/appointment.repository";
import { CreateReviewDTO } from "../schemas/review.schema";
import { AppointmentStatus } from "../schemas/appointment.shema";
import { PaymentStatus } from "@prisma/client";

export class ReviewService {
  constructor(
    private readonly reviewRepository: ReviewRepository,
    private readonly appointmentRepository: AppointmentRepository
  ) {}

  async create(createReviewDTO: CreateReviewDTO, clientId: string) {
    const { appointmentId, rating, comment } = createReviewDTO;

    const appointment = await this.appointmentRepository.findByIdWithRelations(
      appointmentId
    );

    if (!appointment) {
      throw new Error("Agendamento não encontrado.");
    }

    if (appointment.clientId !== clientId) {
      throw new Error(
        "Você não tem permissão para avaliar este agendamento. Apenas o cliente do agendamento pode avaliar."
      );
    }

    if (
      appointment.status !== AppointmentStatus.COMPLETED ||
      appointment.paymentStatus !== PaymentStatus.PAID
    ) {
      throw new Error(
        "Apenas agendamentos concluídos e pagos podem ser avaliados."
      );
    }

    const existingReview =
      await this.reviewRepository.findReviewByAppointmentAndClient(
        appointmentId,
        clientId
      );

    if (existingReview) {
      throw new Error("Este agendamento já foi avaliado.");
    }

    const serviceId = appointment.serviceId;

    const review = await this.reviewRepository.create({
      serviceId,
      clientId,
      rating,
      comment,
    });

    return review;
  }
}
