import { FastifyRequest, FastifyReply } from "fastify";
import {
  signupUserSchema,
  createServiceProviderSchema,
} from "../../schemas/user.schema";
import { UserService } from "../../services/user.service";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async signup(request: FastifyRequest, reply: FastifyReply) {
    const params = signupUserSchema.parse(request.body);
    const user = await this.userService.signup(params);
    return reply.status(201).send(user);
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    const token = await this.userService.login(email, password);

    reply.setTokenCookie(token);
    return reply.status(200).send({ token });
  }

  async createServiceProvider(request: FastifyRequest, reply: FastifyReply) {
    const params = createServiceProviderSchema.parse(request.body);
    const serviceProvider = await this.userService.createServiceProvider(
      params
    );
    return reply.status(201).send(serviceProvider);
  }
}
