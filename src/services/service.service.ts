import { AuthRepository } from "../repository/auth.repository";
import { ServiceRepository } from "../repository/service.repository";
import {
  CreateServiceSchemaDTO,
  FetchServicesQueryParamsDTO,
} from "../schemas/service.schema";

export class ServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async fetch(fetchServicesQueryParamsDTO: FetchServicesQueryParamsDTO) {
    const services = await this.serviceRepository.fetch(
      fetchServicesQueryParamsDTO
    );

    if (!services) {
      throw new Error("No services found");
    }

    return services;
  }

  async fetchById(id: string) {
    const service = await this.serviceRepository.fetchById(id);

    if (!service) {
      throw new Error("No service found");
    }

    return service;
  }

  async create(createServiceSchemaDTO: CreateServiceSchemaDTO) {
    const { categoryId, providerId } = createServiceSchemaDTO;

    const userAlreadyExists = await this.authRepository.findById(providerId);

    if (!userAlreadyExists) {
      throw new Error("User does not exist");
    }

    const serviceProviderExists = await this.authRepository.findById(
      providerId
    );

    if (!serviceProviderExists) {
      throw new Error("User is not a service provider");
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
