import { prisma } from "../lib/prisma";
import { CreateServiceSchemaDTO } from "../schemas/service.schema";

export class ServiceRepository {
  async fetch() {
    const services = await prisma.service.findMany({
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
        providers: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            provider: {
              select: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
            createdAt: true,
            updatedAt: true,
            finishedAt: true,
          },
        },
      },
    });

    return services;
  }

  async create(createServiceSchemaDTO: CreateServiceSchemaDTO) {
    const { name, description, price, providerId, categoryId } =
      createServiceSchemaDTO;

    const service = await prisma.service.create({
      select: {
        id: true,
      },
      data: {
        name,
        description,
        price,
      },
    });

    await prisma.providerService.create({
      data: {
        serviceId: service.id,
        providerId,
        categoryId,
      },
    });

    return service;
  }

  async findCategoryById(categoryId: number) {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    return category;
  }
}
