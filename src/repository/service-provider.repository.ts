import { prisma } from "../lib/prisma";
import { CreateServiceProviderDTO } from "../schemas/service-provider.schema";

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
}
