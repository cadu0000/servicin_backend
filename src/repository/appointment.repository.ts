import { prisma } from "../lib/prisma";
import {
  CreateAppointmentSchemaDTO,
  AppointmentStatus,
} from "../schemas/appointment.shema";

type AppointmentResponse = {
  id: string;
  status: AppointmentStatus;
};

export class AppointmentRepository {
  async create(
    createAppointmentDTO: CreateAppointmentSchemaDTO
  ): Promise<AppointmentResponse> {
    const { serviceId, clientId, scheduledAt, description, paymentMethod } =
      createAppointmentDTO;

    const newAppointment = await prisma.appointment.create({
      data: {
        serviceId: serviceId,
        clientId: clientId,
        scheduledAt: scheduledAt,
        description: description,
        paymentMethod: paymentMethod,
        status: AppointmentStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return newAppointment as AppointmentResponse;
  }
}
