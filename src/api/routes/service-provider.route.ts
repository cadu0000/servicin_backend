import { FastifyInstance } from "fastify";
import { createServiceProviderSchema } from "../../schemas/service-provider.schema";
import { z } from "zod";
import { serviceProviderController } from "../../container";

export async function serviceProviderRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      schema: {
        summary: "Create a service provider",
        description: "Endpoint to promote a user to a service provider",
        tags: ["Service Provider"],
        body: createServiceProviderSchema,
        response: {
          201: z
            .object({
              userId: z
                .string()
                .uuid()
                .describe("ID of the user promoted to service provider"),
            })
            .describe("Service provider created successfully"),
        },
      },
    },
    (request, reply) =>
      serviceProviderController.createServiceProvider(request, reply)
  );
}
