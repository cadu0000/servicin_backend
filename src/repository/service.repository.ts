import { ServiceFiltersDTO } from "../core/dtos/ServiceFiltersDTO";
import { prisma } from "../lib/prisma";
import {
  CreateServiceSchemaDTO,
  FetchServicesQueryParamsDTO,
} from "../schemas/service.schema";

export class ServiceRepository {
  async fetch(
    fetchServicesQueryParamsDTO: FetchServicesQueryParamsDTO &
      ServiceFiltersDTO & { q?: string }
  ) {
    const {
      page = 1,
      pageSize = 12,
      q,
      ...filters
    } = fetchServicesQueryParamsDTO;

    const where: any = {};

    if (q && q.trim().length >= 2 && !filters.category) {
      const searchTerm = q.trim();
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          category: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ];
    } else if (q && q.trim().length >= 2 && filters.category) {
      const searchTerm = q.trim();
      where.name = {
        contains: searchTerm,
        mode: "insensitive",
      };
    }

    if (filters.minPrice !== undefined) {
      where.price = {
        ...where.price,
        gte: filters.minPrice,
      };
    }

    if (filters.maxPrice !== undefined) {
      where.price = {
        ...where.price,
        lte: filters.maxPrice,
      };
    }

    const providerFilters: any = {};

    if (filters.providerName) {
      providerFilters.user = {
        OR: [
          {
            individual: {
              fullName: {
                contains: filters.providerName,
                mode: "insensitive",
              },
            },
          },
          {
            company: {
              tradeName: {
                contains: filters.providerName,
                mode: "insensitive",
              },
            },
          },
          {
            company: {
              corporateName: {
                contains: filters.providerName,
                mode: "insensitive",
              },
            },
          },
        ],
      };
    }

    if (filters.minRating !== undefined) {
      providerFilters.averageRating = {
        gte: filters.minRating,
      };
    }

    if (Object.keys(providerFilters).length > 0) {
      where.provider = providerFilters;
    }

    if (filters.category) {
      where.category = {
        name: {
          equals: filters.category,
          mode: "insensitive",
        },
      };
    }

    if (filters.stateId) {
      where.address = {
        ...where.address,
        stateId: filters.stateId,
      };
    }

    if (filters.cityId) {
      where.address = {
        ...where.address,
        cityId: filters.cityId,
      };
    }

    const services = await prisma.service.findMany({
      where,
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

    const totalServices = await prisma.service.count({ where });
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
    const {
      name,
      description,
      price,
      providerId,
      categoryId,
      addressId,
      availability,
    } = createServiceSchemaDTO;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        price,
        categoryId,
        providerId,
        addressId,
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
}
