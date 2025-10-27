import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { UserRepository } from "../repository/user.repository";
import { CreateServiceProviderDTO } from "../schemas/service-provider.schema";

export class ServiceProviderService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createServiceProvider(params: CreateServiceProviderDTO) {
    const { userId } = params;

    const userAlreadyExists = await this.userRepository.findById(userId);

    if (!userAlreadyExists) {
      throw new Error("User not found");
    }

    const serviceProviderAlreadyExists =
      await this.serviceProviderRepository.findServiceProviderByUserId(userId);

    if (serviceProviderAlreadyExists) {
      throw new Error("Service provider already exists for this user");
    }

    return await this.serviceProviderRepository.createServiceProvider(params);
  }
}
