import { AuthRepository } from "../repository/auth.repository";
import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { CreateServiceProviderDTO } from "../schemas/service-provider.schema";
import { generateSlotTimeIntervals } from "../utils/slot";

export class ServiceProviderService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly authRepository: AuthRepository
  ) {}
  async findById(id: string) {
    const serviceProvider = await this.serviceProviderRepository.findById(id);

    if (!serviceProvider) {
      throw new Error("Service provider not found");
    }

    return serviceProvider;
  }

  async create(params: CreateServiceProviderDTO) {
    const { userId } = params;

    const userAlreadyExists = await this.authRepository.findById(userId);

    if (!userAlreadyExists) {
      throw new Error("User not found");
    }

    const serviceProviderAlreadyExists =
      await this.serviceProviderRepository.findById(userId);

    if (serviceProviderAlreadyExists) {
      throw new Error("Service provider already exists for this user");
    }

    await this.serviceProviderRepository.create(params);
  }
}
