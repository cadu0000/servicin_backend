import MOCK_SERVICES from "../data/service.mock";
import { ServiceFiltersDTO } from "../core/dtos/ServiceFiltersDTO";
import { prisma } from "../lib/prisma";
import {
  CreateServiceSchemaDTO,
  FetchServicesQueryParamsDTO,
} from "../schemas/service.schema";

interface FilterParams extends ServiceFiltersDTO {
  searchTerm?: string;
}
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
        availabilities: true,
        provider: {
          select: {
            userId: true,
            averageRating: true,
            user: {
              select: {
                photoUrl: true,
                individual: {
                  select: {
                    fullName: true,
                  },
                },
                contacts: {
                  select: {
                    type: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
        category: true,
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: "desc",
      },
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
        availabilities: true,
        provider: {
          select: {
            userId: true,
            averageRating: true,
            user: {
              select: {
                photoUrl: true,
                individual: {
                  select: {
                    fullName: true,
                  },
                },
                contacts: {
                  select: {
                    type: true,
                    value: true,
                  },
                },
              },
            },
          },
        },
        category: true,
      },
      where: {
        id,
      },
    });

    return service;
  }

  async create(createServiceSchemaDTO: CreateServiceSchemaDTO) {
    const { name, description, price, providerId, categoryId, availability } =
      createServiceSchemaDTO;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        categoryId,
        providerId,
        availabilities: {
          createMany: {
            data: availability,
          },
        },
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

  async filterServices(filters: FilterParams) {
    let results = MOCK_SERVICES;

    if (filters.searchTerm && filters.searchTerm.trim().length >= 2) {
      const term = filters.searchTerm.toLowerCase().trim();

      results = results.filter((service) => {
        const nameMatch = service.name.toLowerCase().includes(term);
        const axisMatch = service.axis.toLowerCase().includes(term);
        return nameMatch || axisMatch;
      });
    }

    if (filters.minRating !== undefined) {
      results = results.filter(
        (service) => service.averageRating >= filters.minRating!
      );
    }

    if (filters.providerName) {
      const name = filters.providerName.toLowerCase();
      results = results.filter(
        (service) =>
          service.providerName &&
          service.providerName.toLowerCase().includes(name)
      );
    }

    if (filters.axis) {
      const axisTerm = filters.axis.toLowerCase();
      results = results.filter(
        (service) => service.axis.toLowerCase() === axisTerm
      );
    }

    if (filters.minPrice !== undefined) {
      results = results.filter((service) => service.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((service) => service.price <= filters.maxPrice!);
    }

    if (filters.chargeType) {
      const type = filters.chargeType.toLowerCase();
      results = results.filter(
        (service) => service.chargeType.toLowerCase() === type
      );
    }

    return Promise.resolve(results);
  }
}
