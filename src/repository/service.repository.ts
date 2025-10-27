import { prisma } from "../lib/prisma";
import { CreateServiceSchemaDTO } from "../schemas/service.schema";

export class ServiceRepository {
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
