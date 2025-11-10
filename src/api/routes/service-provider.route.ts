import { FastifyInstance } from "fastify";
import { z } from "zod";
import { createServiceProviderSchema } from "../../schemas/service-provider.schema";
import { serviceProviderController } from "../../container";

export async function serviceProviderRoutes(server: FastifyInstance) {
  server.get(
    "/:id",
    {
      schema: {
        summary: "Fetch service provider by ID",
        description: "Endpoint to fetch a service provider by their user ID",
        tags: ["Service Provider"],
        params: z.object({
          id: z.string().uuid().describe("ID of the service provider user"),
        }),
        response: {
          200: z
            .object({
              userId: z
                .string()
                .uuid()
                .describe("ID of the service provider user"),
              serviceDescription: z
                .string()
                .nullable()
                .describe("Description of the service provided"),
              schedule: z
                .array(
                  z.object({
                    dayOfWeek: z
                      .number()
                      .min(0)
                      .max(6)
                      .describe("Day of the week (0 - Sunday, 6 - Saturday)"),
                    timeIntervals: z
                      .array(
                        z
                          .string()
                          .describe("Available time slot in HH:MM format")
                      )
                      .describe("List of available time slots for the day"),
                  })
                )
                .describe("Weekly availability schedule"),
            })
            .describe("Service provider details"),
        },
      },
    },
    async (request, reply) => serviceProviderController.findById(request, reply)
  );

  server.post(
    "/",
    {
      schema: {
        summary: "Create a service provider",
        description: "Endpoint to promote a user to a service provider",
        tags: ["Service Provider"],
        body: createServiceProviderSchema,
        response: {
          201: z.null().describe("Service provider created successfully"),
        },
      },
    },
    (request, reply) => serviceProviderController.create(request, reply)
  );
}
