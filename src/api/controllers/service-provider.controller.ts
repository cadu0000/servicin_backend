import { FastifyRequest, FastifyReply } from "fastify";
import {
  createServiceProviderSchema,
  updateServiceProviderSchema,
} from "../../schemas/service-provider.schema";
import { ServiceProviderService } from "../../services/service-provider.service";
import type { UserPayload } from "../../@types/fastify";
import { sendSuccess, sendError } from "../../utils/response";

export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService
  ) {}
  async findById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const serviceProvider = await this.serviceProviderService.findById(id);
      return sendSuccess(reply, serviceProvider);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("não encontrado") || error.message.includes("não existe")) {
          return sendError(reply, error.message, 404);
        }
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao buscar prestador de serviço", 500);
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = createServiceProviderSchema.parse(request.body);
      await this.serviceProviderService.create(params);
      return sendSuccess(reply, null, "Prestador de serviço criado com sucesso", 201);
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao criar prestador de serviço", 500);
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { sub: userId } = request.user as UserPayload;

      if (id !== userId) {
        return sendError(reply, "Você só pode atualizar seu próprio perfil", 403);
      }

      const params = updateServiceProviderSchema.parse(request.body);
      await this.serviceProviderService.update(id, params);
      return sendSuccess(reply, null, "Prestador de serviço atualizado com sucesso");
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao atualizar prestador de serviço", 500);
    }
  }
}
