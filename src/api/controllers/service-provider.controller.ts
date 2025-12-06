import { FastifyRequest, FastifyReply } from "fastify";
import {
  createServiceProviderSchema,
  updateServiceProviderSchema,
} from "../../schemas/service-provider.schema";
import { ServiceProviderService } from "../../services/service-provider.service";
import type { UserPayload } from "../../@types/fastify";

export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService
  ) {}
  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const serviceProvider = await this.serviceProviderService.findById(id);
    return reply.status(200).send(serviceProvider);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const params = createServiceProviderSchema.parse(request.body);
    await this.serviceProviderService.create(params);
    return reply.status(201).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const { sub: userId } = request.user as UserPayload;

    if (id !== userId) {
      return reply.status(403).send({
        message: "You can only update your own profile",
        code: "FORBIDDEN",
      });
    }

    const params = updateServiceProviderSchema.parse(request.body);
    await this.serviceProviderService.update(id, params);
    return reply.status(200).send();
  }
}
