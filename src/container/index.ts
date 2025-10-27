import { UserController } from "../api/controllers/user.controller";
import { UserRepository } from "../repository/user.repository";
import { UserService } from "../services/user.service";
import { ServiceRepository } from '../repository/service.repository';
import { PublicSearchService } from '../services/public.service';

// Repositories
const userRepository = new UserRepository();
const serviceRepository = new ServiceRepository();

// Services
const userService = new UserService(userRepository);

// Controllers
const userController = new UserController(userService);

export { userController };
export const publicSearchService = new PublicSearchService(serviceRepository);
