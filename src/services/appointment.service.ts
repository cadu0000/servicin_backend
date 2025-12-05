import { AppointmentRepository } from "../repository/appointment.repository";
import { ServiceRepository } from "../repository/service.repository";
import { AuthRepository } from "../repository/auth.repository";
import {
  AppointmentStatus,
  CreateAppointmentSchemaDTO,
} from "../schemas/appointment.shema";
import { Prisma } from "@prisma/client";

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async createAppointment(createAppointmentDTO: CreateAppointmentSchemaDTO) {
    const { serviceId, clientId, scheduledAt } = createAppointmentDTO;

    const clientExists = await this.authRepository.findById(clientId);
    if (!clientExists) {
      throw new Error("Client ID not found.");
    }

    const serviceExists = await this.serviceRepository.fetchById(serviceId);
    if (!serviceExists) {
      throw new Error("Service ID not found.");
    }

    const serviceProviderId = serviceExists.provider.userId;

    if (serviceProviderId === clientId) {
      throw new Error("O cliente não pode agendar um serviço para si mesmo.");
    }

    if (scheduledAt.getDay() === 0) {
      throw new Error("Não é possível agendar serviços aos domingos.");
    }

    const appointment = await this.appointmentRepository.create(
      createAppointmentDTO
    );

    return appointment;
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus
  ) {
    const validStatuses = [
      "PENDING",
      "APPROVED",
      "CANCELED",
      "COMPLETED",
      "REJECTED",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error("Status inválido.");
    }

    try {
      const updatedAppointment = await this.appointmentRepository.updateStatus(
        appointmentId,
        status
      );

      return updatedAppointment;
    } catch (error) {
      console.error("Erro no updateAppointmentStatus:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Agendamento não encontrado.");
        }
      }

      throw error;
    }
  }
}
