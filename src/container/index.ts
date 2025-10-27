import { UserController } from "../api/controllers/user.controller";
import { PublicController } from "../api/controllers/service.controller";

import { UserRepository } from "../repository/user.repository";
import { ServiceRepository } from '../repository/service.repository';

import { UserService } from "../services/user.service";
import { PublicSearchService } from '../services/public.service';

// Repositories
const userRepository = new UserRepository();
const serviceRepository = new ServiceRepository();

// Services
const userService = new UserService(userRepository);
const publicSearchService = new PublicSearchService(serviceRepository);

// Controllers
const userController = new UserController(userService);
const publicController = new PublicController();

export { 
    userController,
    publicController, 
    publicSearchService
};