import { prisma } from "../lib/prisma";
import { CreateServiceProviderDTO } from "../schemas/service-provider.schema";

export class ServiceProviderRepository {
  async createServiceProvider(
    createServiceProviderDTO: CreateServiceProviderDTO
  ) {
    const { userId, serviceDescription, averageRating } =
      createServiceProviderDTO;

    const serviceProvider = await prisma.serviceProvider.create({
      select: {
        userId: true,
      },
      data: {
        userId,
        serviceDescription,
        averageRating,
      },
    });

    return serviceProvider;
  }

  async findServiceProviderByUserId(userId: string) {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      where: {
        userId,
      },
    });

    return serviceProvider;
  }
}
