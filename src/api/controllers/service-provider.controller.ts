import { FastifyRequest, FastifyReply } from "fastify";
import { createServiceProviderSchema } from "../../schemas/service-provider.schema";
import { ServiceProviderService } from "../../services/service-provider.service";

export class ServiceProviderController {
  constructor(
    private readonly serviceProviderService: ServiceProviderService
  ) {}

  async createServiceProvider(request: FastifyRequest, reply: FastifyReply) {
    const params = createServiceProviderSchema.parse(request.body);
    const serviceProvider =
      await this.serviceProviderService.createServiceProvider(params);
    return reply.status(201).send(serviceProvider);
  }
}
