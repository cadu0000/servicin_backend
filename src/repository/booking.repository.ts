import { prisma } from "../lib/prisma";

export class BookingRepository {
  async bookingService(
    serviceId: string,
    customerId: string,
    providerId: string,
    scheduledStart: string,
    notes?: string
  ) {
    const booking = await prisma.booking.create({
      data: {
        serviceId,
        clientId: customerId,
        providerId,
        dateTime: scheduledStart,
        notes: notes || null,
      },
    });

    return booking;
  }
}