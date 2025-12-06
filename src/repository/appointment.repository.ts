import { prisma } from "../lib/prisma";
import { AppointmentStatus } from "../schemas/appointment.shema";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

type AppointmentResponse = {
  id: string;
  status: AppointmentStatus;
};

type CreateAppointmentData = {
  serviceId: string;
  clientId: string;
  scheduledStartTime: Date;
  scheduledEndTime: Date;
  description: string;
  paymentMethod: PaymentMethod;
  price: number;
  status?: AppointmentStatus;
};

export class AppointmentRepository {
  async create(
    createAppointmentData: CreateAppointmentData
  ): Promise<AppointmentResponse> {
    const {
      serviceId,
      clientId,
      scheduledStartTime,
      scheduledEndTime,
      description,
      paymentMethod,
      price,
      status,
    } = createAppointmentData;

    const newAppointment = await prisma.appointment.create({
      data: {
        serviceId: serviceId,
        clientId: clientId,
        scheduledStartTime: scheduledStartTime,
        scheduledEndTime: scheduledEndTime,
        description: description,
        paymentMethod: paymentMethod,
        price: price,
        status: status || AppointmentStatus.PENDING,
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
    status: AppointmentStatus,
    cancellationReason?: string
  ): Promise<AppointmentResponse> {
    const updateData: {
      status: AppointmentStatus;
      cancellationReason?: string;
    } = {
      status: status,
    };

    if (status === AppointmentStatus.CANCELED && cancellationReason) {
      updateData.cancellationReason = cancellationReason;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: updateData,
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
        scheduledStartTime: { gt: now },
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

  async findByIdWithRelations(appointmentId: string) {
    return await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
      select: {
        id: true,
        status: true,
        clientId: true,
        paymentMethod: true,
        paymentStatus: true,
        service: {
          select: {
            providerId: true,
          },
        },
      },
    });
  }

  async completeService(appointmentId: string): Promise<AppointmentResponse> {
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: AppointmentStatus.COMPLETED,
        paymentStatus: PaymentStatus.PENDING,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return updatedAppointment as AppointmentResponse;
  }

  async confirmPayment(appointmentId: string): Promise<AppointmentResponse> {
    const updatedAppointment = await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
      select: {
        id: true,
        status: true,
      },
    });

    return updatedAppointment as AppointmentResponse;
  }

  async findProviderAppointmentsByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date
  ) {
    const providerServices = await prisma.service.findMany({
      where: { providerId },
      select: { id: true },
    });

    const serviceIds = providerServices.map((ps) => ps.id);

    if (serviceIds.length === 0) {
      return [];
    }

    return await prisma.appointment.findMany({
      where: {
        serviceId: { in: serviceIds },
        scheduledStartTime: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: [AppointmentStatus.PENDING, AppointmentStatus.APPROVED],
        },
      },
      select: {
        id: true,
        scheduledStartTime: true,
        scheduledEndTime: true,
        service: {
          select: {
            id: true,
            availabilities: {
              select: {
                slotDuration: true,
              },
            },
          },
        },
      },
    });
  }
}
