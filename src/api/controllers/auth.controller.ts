import { FastifyRequest, FastifyReply } from "fastify";
import { signupUserSchema } from "../../schemas/auth.schema";
import { AuthService } from "../../services/auth.service";

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

  async logout(request: FastifyRequest, reply: FastifyReply) {
    if (!request.cookies.token) {
      return reply
        .status(400)
        .send({ message: "Unable to logout: No active session" });
    }

    reply.clearTokenCookie();
    return reply.status(200).send({ message: "Logged out successfully" });
  }
}
