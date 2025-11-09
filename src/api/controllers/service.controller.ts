import { FastifyReply, FastifyRequest } from "fastify";
import { ServiceService } from "../../services/service.service";
import {
  createServiceSchema,
  fetchServicesQueryParamsSchema,
} from "../../schemas/service.schema";

export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  async fetch(request: FastifyRequest, reply: FastifyReply) {
    const params = fetchServicesQueryParamsSchema.parse(request.query);
    const services = await this.serviceService.fetch(params);
    return reply.send(services);
  }

  async fetchById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const service = await this.serviceService.fetchById(id);
    return reply.send(service);
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    const params = createServiceSchema.parse(request.body);
    const service = await this.serviceService.create(params);
    return reply.status(201).send(service);
  }
}
