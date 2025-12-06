import { AppointmentRepository } from "../repository/appointment.repository";
import { ServiceRepository } from "../repository/service.repository";
import { AuthRepository } from "../repository/auth.repository";
import {
  AppointmentStatus,
  CreateAppointmentSchemaDTO,
} from "../schemas/appointment.shema";
import { Prisma } from "@prisma/client";
import {
  generateSlotTimeIntervals,
  isTimeIntervalIncluded,
  TimeInterval,
  toMinutes,
} from "../utils/slot";

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async createAppointment(
    createAppointmentDTO: CreateAppointmentSchemaDTO & { clientId: string }
  ) {
    const { serviceId, clientId, scheduledStartTime, scheduledEndTime } =
      createAppointmentDTO;

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

    if (scheduledStartTime.getDay() === 0) {
      throw new Error("Não é possível agendar serviços aos domingos.");
    }

    const dayOfWeek = scheduledStartTime.getDay();
    const availability = serviceExists.availabilities.find(
      (av) => av.dayOfWeek === dayOfWeek
    );

    if (!availability) {
      throw new Error("O serviço não está disponível neste dia da semana.");
    }

    const scheduledTime = `${scheduledStartTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${scheduledStartTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const scheduledEndTimeString = `${scheduledEndTime
      .getHours()
      .toString()
      .padStart(2, "0")}:${scheduledEndTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const scheduledMinutes = toMinutes(scheduledTime);
    const scheduledEndMinutes = toMinutes(scheduledEndTimeString);
    const availabilityStart = toMinutes(availability.startTime);
    const availabilityEnd = toMinutes(availability.endTime);

    if (
      scheduledMinutes < availabilityStart ||
      scheduledMinutes >= availabilityEnd
    ) {
      throw new Error(
        "O horário de início está fora do horário de disponibilidade do serviço."
      );
    }

    if (
      scheduledEndMinutes <= availabilityStart ||
      scheduledEndMinutes > availabilityEnd
    ) {
      throw new Error(
        "O horário de término está fora do horário de disponibilidade do serviço."
      );
    }

    if (scheduledEndMinutes <= scheduledMinutes) {
      throw new Error(
        "O horário de término deve ser posterior ao horário de início."
      );
    }

    if (availability.breakStart && availability.breakEnd) {
      const breakStart = toMinutes(availability.breakStart);
      const breakEnd = toMinutes(availability.breakEnd);
      if (
        (scheduledMinutes >= breakStart && scheduledMinutes < breakEnd) ||
        (scheduledEndMinutes > breakStart && scheduledEndMinutes <= breakEnd) ||
        (scheduledMinutes < breakStart && scheduledEndMinutes > breakEnd)
      ) {
        throw new Error(
          "O horário solicitado está no período de intervalo do prestador."
        );
      }
    }

    const slotDuration = availability.slotDuration;
    const appointmentDurationMinutes =
      (scheduledEndTime.getTime() - scheduledStartTime.getTime()) / (1000 * 60);

    if (appointmentDurationMinutes < slotDuration) {
      throw new Error(
        `A duração mínima do agendamento é de ${slotDuration} minutos.`
      );
    }

    const slots = generateSlotTimeIntervals(
      availability.startTime,
      availability.endTime,
      availability.slotDuration,
      availability.breakStart,
      availability.breakEnd
    );

    if (!slots.includes(scheduledTime)) {
      throw new Error(
        "O horário de início não corresponde a um slot de disponibilidade válido."
      );
    }

    const startOfDay = new Date(scheduledStartTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(scheduledStartTime);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments =
      await this.appointmentRepository.findProviderAppointmentsByDateRange(
        serviceProviderId,
        startOfDay,
        endOfDay
      );

    const appointmentInterval: TimeInterval = {
      start: scheduledTime,
      end: scheduledEndTimeString,
    };

    const consumedIntervals: TimeInterval[] = existingAppointments.map(
      (apt) => {
        const aptStartDate = new Date(apt.scheduledStartTime);
        const aptEndDate = new Date(apt.scheduledEndTime);

        const aptStartTime = `${aptStartDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${aptStartDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const aptEndTime = `${aptEndDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${aptEndDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        return { start: aptStartTime, end: aptEndTime };
      }
    );

    if (isTimeIntervalIncluded(appointmentInterval, consumedIntervals)) {
      throw new Error(
        "O horário solicitado já está ocupado por outro agendamento."
      );
    }

    const servicePrice = Number(serviceExists.price);
    const priceMultiplier = appointmentDurationMinutes / slotDuration;
    const price = servicePrice * priceMultiplier;

    const initialStatus = serviceExists.provider.autoAcceptAppointments
      ? AppointmentStatus.APPROVED
      : AppointmentStatus.PENDING;

    const appointment = await this.appointmentRepository.create({
      serviceId: createAppointmentDTO.serviceId,
      clientId: createAppointmentDTO.clientId,
      scheduledStartTime: createAppointmentDTO.scheduledStartTime,
      scheduledEndTime,
      description: createAppointmentDTO.description,
      paymentMethod: createAppointmentDTO.paymentMethod,
      price,
      status: initialStatus,
    });

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
