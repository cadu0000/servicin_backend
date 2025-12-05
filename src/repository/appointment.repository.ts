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

  async updateStatus(
    appointmentId: string,
    status: AppointmentStatus
  ): Promise<AppointmentResponse> {
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: status,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return updatedAppointment as AppointmentResponse;
  }

  async cancelFutureAppointmentsForProvider(
    providerId: string
  ): Promise<number> {
    const now = new Date();

    const providerServices = await prisma.service.findMany({
      where: { providerId },
      select: { id: true },
    });

    const serviceIds = providerServices.map((ps) => ps.id);

    if (serviceIds.length === 0) {
      return 0;
    }

    const result = await prisma.appointment.updateMany({
      where: {
        serviceId: { in: serviceIds },
        scheduledAt: { gt: now },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED],
        },
      },
      data: {
        status: AppointmentStatus.CANCELED,
      },
    });

    return result.count;
  }
}
