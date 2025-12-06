import { ServiceProviderController } from "../api/controllers/service-provider.controller";
import { ServiceController } from "../api/controllers/service.controller";
import { AuthController } from "../api/controllers/auth.controller";
import { AppointmentController } from "../api/controllers/appointment.controller";
import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { ServiceRepository } from "../repository/service.repository";
import { AppointmentRepository } from "../repository/appointment.repository";
import { AuthRepository } from "../repository/auth.repository";
import { ServiceProviderService } from "../services/service-provider.service";
import { ServiceService } from "../services/service.service";
import { AuthService } from "../services/auth.service";
import { CategoryRepository } from "../repository/category.repository";
import { CategoryController } from "../api/controllers/category.controller";
import { CategoryService } from "../services/category.service";
import { AppointmentService } from "../services/appointment.service";
import { LocationRepository } from "../repository/location.repository";
import { LocationService } from "../services/location.service";
import { LocationController } from "../api/controllers/location.controller";

// Repositories
const authRepository = new AuthRepository();
const serviceRepository = new ServiceRepository();
const serviceProviderRepository = new ServiceProviderRepository();
const categoryRepository = new CategoryRepository();
const appointmentRepository = new AppointmentRepository();
const locationRepository = new LocationRepository();

// Services
const authService = new AuthService(authRepository, appointmentRepository);
const serviceService = new ServiceService(serviceRepository, authRepository);
const serviceProviderService = new ServiceProviderService(
  serviceProviderRepository,
  authRepository
);
const categoryService = new CategoryService(categoryRepository, authRepository);
const appointmentService = new AppointmentService(
  appointmentRepository,
  serviceRepository,
  authRepository
);
const locationService = new LocationService(locationRepository);

// Controllers
const authController = new AuthController(authService);
const serviceController = new ServiceController(serviceService);
const serviceProviderController = new ServiceProviderController(
  serviceProviderService
);
const categoryController = new CategoryController(categoryService);
const appointmentController = new AppointmentController(appointmentService);
const locationController = new LocationController(locationService);

export {
  authController,
  serviceController,
  serviceProviderController,
  categoryController,
  appointmentController,
  locationController,
};
