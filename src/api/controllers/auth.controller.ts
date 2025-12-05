import { FastifyRequest, FastifyReply } from "fastify";
import { signupUserSchema } from "../../schemas/auth.schema";
import { AuthService } from "../../services/auth.service";
import type { UserPayload } from "../../@types/fastify";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signup(request: FastifyRequest, reply: FastifyReply) {
    const params = signupUserSchema.parse(request.body);
    const token = await this.authService.signup(params);
    reply.setTokenCookie(token);
    return reply.status(201).send({ token });
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    const token = await this.authService.login(email, password);

    reply.setTokenCookie(token);
    return reply.status(200).send({ token });
  }

  async logout(_: FastifyRequest, reply: FastifyReply) {
    reply.clearTokenCookie();
    return reply.status(200).send({ message: "Logged out successfully" });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const { sub: userId } = request.user as UserPayload;
    const user = await this.authService.getCurrentUser(userId);
    return reply.status(200).send(user);
  }
}
