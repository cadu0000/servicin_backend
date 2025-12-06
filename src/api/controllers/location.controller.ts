import { FastifyRequest, FastifyReply } from "fastify";
import { LocationService } from "../../services/location.service";

export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  async getStates(reply: FastifyReply) {
    const states = await this.locationService.getStates();
    return reply.code(200).send(states);
  }

  async getCitiesByState(request: FastifyRequest, reply: FastifyReply) {
    const { stateId } = request.params as { stateId: string };

    try {
      const cities = await this.locationService.getCitiesByState(stateId);
      return reply.code(200).send(cities);
    } catch (error) {
      const message = (error as Error).message;

      if (message === "404") {
        return reply.code(404).send({
          statusCode: 404,
          error: "Not Found",
          message: "State not found",
        });
      }

      return reply.code(500).send({
        statusCode: 500,
        error: "Internal Server Error",
        message: "Unexpected error.",
      });
    }
  }
}
