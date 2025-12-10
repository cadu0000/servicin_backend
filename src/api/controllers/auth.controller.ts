import { FastifyRequest, FastifyReply } from "fastify";
import { signupUserSchema } from "../../schemas/auth.schema";
import { AuthService } from "../../services/auth.service";
import type { UserPayload } from "../../@types/fastify";
import { sendSuccess, sendError } from "../../utils/response";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async signup(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = signupUserSchema.parse(request.body);
      const token = await this.authService.signup(params);
      reply.setTokenCookie(token);
      return sendSuccess(reply, { token }, "Usuário criado com sucesso", 201);
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao criar usuário", 500);
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as {
        email: string;
        password: string;
      };
      const token = await this.authService.login(email, password);

      reply.setTokenCookie(token);
      return sendSuccess(reply, { token }, "Login realizado com sucesso");
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 401);
      }
      return sendError(reply, "Erro ao realizar login", 500);
    }
  }

  async logout(_: FastifyRequest, reply: FastifyReply) {
    reply.clearTokenCookie();
    return sendSuccess(reply, null, "Logout realizado com sucesso");
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sub: userId } = request.user as UserPayload;
      const user = await this.authService.getCurrentUser(userId);
      return sendSuccess(reply, user);
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 404);
      }
      return sendError(reply, "Erro ao buscar usuário", 500);
    }
  }

  async deleteMe(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sub: userId } = request.user as UserPayload;
      await this.authService.deleteAccount(userId);
      return sendSuccess(reply, null, "Conta excluída com sucesso");
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao excluir conta", 500);
    }
  }
}
