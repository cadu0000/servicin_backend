import { FastifyReply, FastifyRequest } from "fastify";
import {
  PublicSearchQueryType,
  createServiceSchema,
} from "../../schemas/service.schema";
import { InvalidInputError } from "../../core/errors/InvalidInputError";
import { ServiceService } from "../../services/service.service";

interface SearchQuery {
  q?: string;
}

type SearchRequest = FastifyRequest<{ Querystring: PublicSearchQueryType }>;

export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  async fetch(_: FastifyRequest, reply: FastifyReply) {
    const services = await this.serviceService.fetch();
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

  async searchServicesHandler(
    req: SearchRequest,
    res: FastifyReply
  ): Promise<void> {
    const filters = req.query;

    try {
      const results = await this.serviceService.searchService(filters);
      res.status(200).send(results);
    } catch (error) {
      if (error instanceof InvalidInputError) {
        console.warn(`[API] Invalid Input: ${error.message}`);
        return res.status(400).send({
          message: error.message,
          code: "INVALID_INPUT",
        });
      }

      console.error("[API] Internal Error during search:", error);
      return res.status(500).send({
        message: "Falha interna ao processar a busca.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
}