import { ServiceProviderController } from "../api/controllers/service-provider.controller";
import { ServiceController } from "../api/controllers/service.controller";
import { AuthController } from "../api/controllers/auth.controller";
import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { ServiceRepository } from "../repository/service.repository";
import { AuthRepository } from "../repository/auth.repository";
import { ServiceProviderService } from "../services/service-provider.service";
import { ServiceService } from "../services/service.service";
import { AuthService } from "../services/auth.service";
import { CategoryRepository } from "../repository/category.repository";
import { CategoryController } from "../api/controllers/category.controller";
import { CategoryService } from "../services/category.service";
import { BookingController } from "../api/controllers/booking.controller";
import { BookingService } from "../services/booking.service";
import { BookingRepository } from "../repository/booking.repository";

// Repositories
const authRepository = new AuthRepository();
const serviceRepository = new ServiceRepository();
const serviceProviderRepository = new ServiceProviderRepository();
const categoryRepository = new CategoryRepository();
const bookingRepository = new BookingRepository();

// Services
const authService = new AuthService(authRepository);
const serviceService = new ServiceService(serviceRepository, authRepository);
const serviceProviderService = new ServiceProviderService(
  serviceProviderRepository,
  authRepository
);
const categoryService = new CategoryService(categoryRepository);
const bookingService = new BookingService(
  serviceRepository,
  authRepository,
  serviceProviderRepository,
  bookingRepository
);

// Controllers
const authController = new AuthController(authService);
const serviceController = new ServiceController(serviceService);
const serviceProviderController = new ServiceProviderController(
  serviceProviderService
);
const categoryController = new CategoryController(categoryService);
const bookingController = new BookingController(bookingService);

export { authController, serviceController, serviceProviderController, categoryController, bookingController };
