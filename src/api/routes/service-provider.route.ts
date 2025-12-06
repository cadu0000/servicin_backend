import { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createServiceProviderSchema,
  updateServiceProviderSchema,
} from "../../schemas/service-provider.schema";
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
              averageRating: z.coerce
                .string()
                .describe("Average rating of the service provider (0.00 to 5.00)"),
              services: z
                .array(
                  z.object({
                    id: z
                      .string()
                      .uuid()
                      .describe("Unique identifier for the service"),
                    name: z.string().describe("Name of the service"),
                    description: z
                      .string()
                      .nullable()
                      .describe("Description of the service"),
                    price: z.coerce
                      .string()
                      .describe("Price of the service in BRL"),
                    rating: z.coerce
                      .string()
                      .describe("Average rating of the service (0.00 to 5.00)"),
                    photos: z
                      .array(
                        z.object({
                          id: z
                            .string()
                            .uuid()
                            .describe("Unique identifier for the photo"),
                          photoUrl: z.string().describe("URL of the photo"),
                        })
                      )
                      .describe("List of photos associated with the service"),
                    availabilities: z
                      .array(
                        z.object({
                          id: z
                            .string()
                            .uuid()
                            .describe("Unique identifier for the availability"),
                          dayOfWeek: z
                            .number()
                            .min(0)
                            .max(6)
                            .describe(
                              "Day of the week (0 - Sunday, 6 - Saturday)"
                            ),
                          startTime: z
                            .string()
                            .describe("Start time in HH:MM format"),
                          endTime: z
                            .string()
                            .describe("End time in HH:MM format"),
                          breakStart: z
                            .string()
                            .nullable()
                            .describe("Break start time in HH:MM format"),
                          breakEnd: z
                            .string()
                            .nullable()
                            .describe("Break end time in HH:MM format"),
                          slotDuration: z
                            .number()
                            .describe(
                              "Duration of each service slot in minutes"
                            ),
                          serviceId: z
                            .string()
                            .uuid()
                            .nullable()
                            .describe("ID of the service"),
                        })
                      )
                      .describe("List of availability schedules"),
                    category: z
                      .object({
                        id: z
                          .number()
                          .describe("Unique identifier for the category"),
                        name: z.string().describe("Name of the category"),
                        description: z
                          .string()
                          .nullable()
                          .describe("Description of the category"),
                      })
                      .describe("Category details"),
                  })
                )
                .describe("List of services provided"),
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

  server.patch(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Update service provider profile",
        description:
          "Endpoint to update service provider profile settings. Requires authentication.",
        tags: ["Service Provider"],
        params: z.object({
          id: z.string().uuid().describe("ID of the service provider user"),
        }),
        body: updateServiceProviderSchema,
        response: {
          200: z.null().describe("Service provider updated successfully"),
        },
      },
    },
    (request, reply) => serviceProviderController.update(request, reply)
  );
}
