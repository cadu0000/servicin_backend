import { FastifyRequest, FastifyReply } from "fastify";
import { createServiceProviderSchema } from "../../schemas/service-provider.schema";
import { ServiceProviderService } from "../../services/service-provider.service";

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
}
