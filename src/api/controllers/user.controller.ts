import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../../services/user.service";
import { signUpUserSchema } from "../../schemas/user.schema";

export class UserController {
  constructor(private readonly userService: UserService) {}

  async signup(request: FastifyRequest, reply: FastifyReply) {
    const params = signUpUserSchema.parse(request.body);
    const user = await this.userService.signup(params);
    return reply.status(201).send(user);
  }
}
