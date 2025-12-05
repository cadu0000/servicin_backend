import { prisma } from "../lib/prisma";
import { CreateServiceProviderDTO } from "../schemas/service-provider.schema";

export class ServiceProviderRepository {
  async findById(id: string) {
    const serviceProvider = await prisma.serviceProvider.findUnique({
      select: {
        userId: true,
        services: {
          select: {
            id: true,
            name: true,
            description: true,
            price: true,
            photos: {
              select: {
                id: true,
                photoUrl: true,
              },
            },
            availabilities: true,
            category: true,
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
    const { userId } = createServiceProviderDTO;

    await prisma.serviceProvider.create({
      data: {
        userId,
      },
    });
  }
}
