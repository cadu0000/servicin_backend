import { FastifyInstance } from "fastify";
import { createServiceSchema } from "../../schemas/service.schema";
import { z } from "zod";
import { serviceController } from "../../container";

export async function serviceRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      schema: {
        summary: "Create a new service",
        description: "Endpoint to create a new service",
        tags: ["Service"],
        body: createServiceSchema,
        response: {
          201: z.object({
            id: z.string().uuid().describe("Unique identifier for the service"),
          }),
        },
      },
    },
    async (request, reply) => serviceController.create(request, reply)
  );
}
