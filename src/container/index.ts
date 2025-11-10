import { ServiceProviderController } from "../api/controllers/service-provider.controller";
import { ServiceController } from "../api/controllers/service.controller";
import { AuthController } from "../api/controllers/auth.controller";
import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { ServiceRepository } from "../repository/service.repository";
import { AuthRepository } from "../repository/auth.repository";
import { ServiceProviderService } from "../services/service-provider.service";
import { ServiceService } from "../services/service.service";
import { AuthService } from "../services/auth.service";

// Repositories
const authRepository = new AuthRepository();
const serviceRepository = new ServiceRepository();
const serviceProviderRepository = new ServiceProviderRepository();

// Services
const authService = new AuthService(authRepository);
const serviceService = new ServiceService(serviceRepository, authRepository);
const serviceProviderService = new ServiceProviderService(
  serviceProviderRepository,
  authRepository
);

// Controllers
const authController = new AuthController(authService);
const serviceController = new ServiceController(serviceService);
const serviceProviderController = new ServiceProviderController(
  serviceProviderService
);

export { authController, serviceController, serviceProviderController };
