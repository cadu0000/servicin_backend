import { UserRepository } from "./../repository/user.repository";
import { ServiceRepository } from "../repository/service.repository";
import { CreateServiceSchemaDTO } from "../schemas/service.schema";

export class ServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly userRepository: UserRepository
  ) {}

  async create(createServiceSchemaDTO: CreateServiceSchemaDTO) {
    const { categoryId, providerId } = createServiceSchemaDTO;

    const serviceProviderExists =
      await this.userRepository.findServiceProviderByUserId(providerId);

    if (!serviceProviderExists) {
      throw new Error("Service provider does not exist");
    }

    const categoryExists = await this.serviceRepository.findCategoryById(
      categoryId
    );

    if (!categoryExists) {
      throw new Error("Category does not exist");
    }

    const service = await this.serviceRepository.create(createServiceSchemaDTO);

    if (!service) {
      throw new Error("Error creating service");
    }

    return service;
  }
}
