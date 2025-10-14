import { UserController } from "../api/controllers/user.controller";
import { UserRepository } from "../repository/user.repository";
import { UserService } from "../services/user.service";

// Repositories
const userRepository = new UserRepository();

// Services
const userService = new UserService(userRepository);

// Controllers
const userController = new UserController(userService);

export { userController };
