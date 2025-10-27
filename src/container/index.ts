import { ServiceProviderController } from "../api/controllers/service-provider.controller";
import { UserController } from "../api/controllers/user.controller";
import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { UserRepository } from "../repository/user.repository";
import { ServiceProviderService } from "../services/service-provider.service";
import { UserService } from "../services/user.service";

// Repositories
const userRepository = new UserRepository();
const serviceProviderRepository = new ServiceProviderRepository();

// Services
const userService = new UserService(userRepository);
const serviceProviderService = new ServiceProviderService(
  serviceProviderRepository,
  userRepository
);

// Controllers
const userController = new UserController(userService);
const serviceProviderController = new ServiceProviderController(
  serviceProviderService
);

export { userController, serviceProviderController };
