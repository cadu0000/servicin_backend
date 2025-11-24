import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { prisma } from "../lib/prisma";
import { CreateServiceProviderDTO } from "../schemas/service-provider.schema";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);

export class ServiceProviderRepository {
  async findById(id: string) {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      select: {
        userId: true,
        serviceDescription: true,
        serviceProviderAvailabilities: {
          select: {
            dayOfWeek: true,
            startTime: true,
            endTime: true,
            breakStart: true,
            breakEnd: true,
            slotDuration: true,
          },
        },
      },
      where: {
        userId: id,
      },
    });

    return serviceProvider;
  }

  async create(createServiceProviderDTO: CreateServiceProviderDTO) {
    const { userId, serviceDescription, availability } =
      createServiceProviderDTO;

    const serviceProvider = await prisma.serviceProvider.create({
      select: {
        userId: true,
      },
      data: {
        userId,
        serviceDescription,
      },
    });

    await prisma.serviceProviderAvailability.createMany({
      data: availability.map((slot) => ({
        providerId: serviceProvider.userId,
        ...slot,
      })),
    });
  }

async isSlotFree(providerId: string, dateTime: string) {
    const existingBooking = await prisma.booking.findFirst({
      where: {
        providerId,
        dateTime,
        status: { not: "CANCELED" },
      },
    });

    return !existingBooking;
  }

  async isProviderAvailable(providerId: string, scheduledStartLocal: string): Promise<boolean> {
    
    const date = dayjs(scheduledStartLocal);
    const dayOfWeekJS = date.day();

    const timeToMinutes = (timeString: string): number => {
        const [hour, minute] = timeString.split(':').map(Number);
        return hour * 60 + minute;
    };

    let dayOfWeekDB;
    if (dayOfWeekJS === 0) {
        dayOfWeekDB = 7;
    } else {
        dayOfWeekDB = dayOfWeekJS + 1;
    }

    const scheduledTime = date.format("HH:mm");

    const availability = await prisma.serviceProviderAvailability.findUnique({
      where: {
        providerId_dayOfWeek: {
          providerId,
          dayOfWeek: dayOfWeekDB,
        },
      },
    });

    if (!availability) {
      return false;
    }

    const startTime = availability.startTime;
    const endTime = availability.endTime;
    const slotDuration = availability.slotDuration;

    // Correção: Conversão robusta de strings de horário para minutos
    const totalMinutesScheduled = timeToMinutes(scheduledTime);
    const totalMinutesStart = timeToMinutes(startTime);
    const totalMinutesEnd = timeToMinutes(endTime);
    
    const totalMinutesScheduledEnd = totalMinutesScheduled + slotDuration;

    const isWithinBounds = 
      totalMinutesScheduled >= totalMinutesStart &&
      totalMinutesScheduledEnd <= totalMinutesEnd;

    const isSlotFree = await this.isSlotFree(providerId, scheduledStartLocal);
    
    return isWithinBounds && isSlotFree;
  }
}