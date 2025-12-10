import { FastifyRequest, FastifyReply } from "fastify";
import { LocationService } from "../../services/location.service";
import { sendSuccess, sendError } from "../../utils/response";

export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  async getStates(reply: FastifyReply) {
    try {
      const states = await this.locationService.getStates();
      return sendSuccess(reply, states);
    } catch (error) {
      return sendError(reply, "Erro ao buscar estados", 500);
    }
  }

  async getCitiesByState(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { stateId } = request.params as { stateId: string };
      const cities = await this.locationService.getCitiesByState(stateId);
      return sendSuccess(reply, cities);
    } catch (error) {
      const message = (error as Error).message;

      if (message === "404") {
        return sendError(reply, "Estado não encontrado", 404);
      }

      return sendError(reply, "Erro inesperado", 500);
    }
  }
}
