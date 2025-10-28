import { ServiceController } from "../api/controllers/service.controller";
import { UserController } from "../api/controllers/user.controller";
import { ServiceRepository } from "../repository/service.repository";
import { UserRepository } from "../repository/user.repository";
import { ServiceService } from "../services/service.service";
import { UserService } from "../services/user.service";

// Repositories
const userRepository = new UserRepository();
const serviceRepository = new ServiceRepository();

// Services
const userService = new UserService(userRepository);
const serviceService = new ServiceService(serviceRepository, userRepository);

// Controllers
const userController = new UserController(userService);
const serviceController = new ServiceController(serviceService);

export { userController, serviceController };
