import { FastifyReply, FastifyRequest } from "fastify";
import {
  createServiceSchema,
  fetchServicesQueryParamsSchema,
} from "../../schemas/service.schema";
import { ServiceService } from "../../services/service.service";
import { sendSuccess, sendError } from "../../utils/response";

export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  async fetch(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = fetchServicesQueryParamsSchema.parse(request.query);
      const services = await this.serviceService.fetch(params);
      return sendSuccess(reply, services);
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao buscar serviços", 500);
    }
  }

  async fetchById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const service = await this.serviceService.fetchById(id);
      return sendSuccess(reply, service);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("não encontrado") || error.message.includes("não existe")) {
          return sendError(reply, error.message, 404);
        }
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao buscar serviço", 500);
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = createServiceSchema.parse(request.body);
      const service = await this.serviceService.create(params);
      return sendSuccess(reply, service, "Serviço criado com sucesso", 201);
    } catch (error) {
      if (error instanceof Error) {
        return sendError(reply, error.message, 400);
      }
      return sendError(reply, "Erro ao criar serviço", 500);
    }
  }
}
