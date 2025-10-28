import { prisma } from "../lib/prisma";
import {
  CreateServiceSchemaDTO,
  FetchServicesQueryParamsDTO,
} from "../schemas/service.schema";

export class ServiceRepository {
  async fetch(fetchServicesQueryParamsDTO: FetchServicesQueryParamsDTO) {
    const { page, pageSize } = fetchServicesQueryParamsDTO;

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
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalServices = await prisma.service.count();
    const totalPages = Math.ceil(totalServices / pageSize);

    return {
      data: services,
      total: totalServices,
      page,
      pageSize,
      totalPages,
    };
  }

  async fetchById(id: string) {
    const service = await prisma.service.findUnique({
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
      where: {
        id,
      },
    });

    return service;
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
