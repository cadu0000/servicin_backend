import { FastifyInstance } from "fastify";
import { z } from "zod";
import { locationController } from "../../container";
import {
  stateSchema,
  citySchema,
  getCitiesByStateParamsSchema,
} from "../../schemas/location.schema";
import {
  createApiResponseSchema,
  createErrorResponseSchema,
} from "../../utils/response";

export async function locationRoutes(server: FastifyInstance) {
  server.get(
    "/states",
    {
      schema: {
        summary: "List all states",
        description: "Endpoint to fetch all states from Brazil",
        tags: ["Location"],
        response: {
          200: createApiResponseSchema(z.array(stateSchema)),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => locationController.getStates(reply)
  );

  server.get(
    "/states/:stateId/cities",
    {
      schema: {
        summary: "List cities by state",
        description: "Endpoint to fetch all cities from a specific state",
        tags: ["Location"],
        params: getCitiesByStateParamsSchema,
        response: {
          200: createApiResponseSchema(z.array(citySchema)),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) =>
      locationController.getCitiesByState(request, reply)
  );
}
