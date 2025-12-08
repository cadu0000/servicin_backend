import { FastifyInstance } from "fastify";
import { z } from "zod";
import { locationController } from "../../container";
import {
  stateSchema,
  citySchema,
  getCitiesByStateParamsSchema,
} from "../../schemas/location.schema";

export async function locationRoutes(server: FastifyInstance) {
  server.get(
    "/states",
    {
      schema: {
        summary: "List all states",
        description: "Endpoint to fetch all states from Brazil",
        tags: ["Location"],
        response: {
          200: z.array(stateSchema).describe("List of all states from Brazil"),
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
          200: z
            .array(citySchema)
            .describe("List of all cities from the specified state"),
          404: z.object({
            statusCode: z.number().describe("HTTP status code"),
            error: z.string().describe("Error type"),
            message: z.string().describe("Error message"),
          }),
        },
      },
    },
    async (request, reply) =>
      locationController.getCitiesByState(request, reply)
  );
}
