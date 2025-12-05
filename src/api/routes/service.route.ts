import { FastifyInstance } from "fastify";
import { serviceController } from "../../container";
import { z } from "zod";
import {
  createServiceSchema,
  PublicSearchQuerySchema,
} from "../../schemas/service.schema";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        summary: "Fetch all services",
        description: "Endpoint to fetch all available services",
        tags: ["Service"],
        querystring: z.object({
          page: z.coerce
            .number()
            .default(1)
            .describe("Page number for pagination"),
          pageSize: z.coerce
            .number()
            .default(12)
            .describe("Number of items per page for pagination"),
        }),
        response: {
          200: z.object({
            total: z.number().describe("Total number of services"),
            totalPages: z.number().describe("Total number of pages"),
            page: z.number().describe("Current page number"),
            pageSize: z.number().describe("Number of services per page"),
            data: z
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
                          .describe("Duration of each service slot in minutes"),
                        serviceId: z
                          .string()
                          .uuid()
                          .nullable()
                          .describe("ID of the service"),
                      })
                    )
                    .describe("List of availability schedules"),
                  provider: z
                    .object({
                      userId: z
                        .string()
                        .uuid()
                        .describe("Unique identifier for the service provider"),
                      averageRating: z.coerce
                        .string()
                        .describe("Average rating of the service provider"),
                      user: z
                        .object({
                          photoUrl: z
                            .string()
                            .nullable()
                            .describe("URL of the user's profile photo"),
                          individual: z
                            .object({
                              fullName: z
                                .string()
                                .describe("Full name of the individual user"),
                            })
                            .nullable()
                            .describe("Individual user details"),
                          contacts: z
                            .array(
                              z.object({
                                type: z
                                  .enum(["EMAIL", "PHONE"])
                                  .describe("Type of contact (EMAIL or PHONE)"),
                                value: z.string().describe("Contact value"),
                              })
                            )
                            .describe("List of user contacts"),
                        })
                        .describe("User details"),
                    })
                    .describe("Service provider details"),
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
              .describe("Array of service objects"),
          }),
        },
      },
    },
    async (request, reply) => serviceController.fetch(request, reply)
  );

  server.get(
    "/search",
    {
      schema: {
        summary: "Search for services",
        description:
          "Endpoint to search for services based on various criteria",
        tags: ["Service"],
        querystring: PublicSearchQuerySchema,
      },
    },
    (request, reply) => serviceController.searchServicesHandler(request, reply)
  );

  server.get(
    "/:id",
    {
      schema: {
        summary: "Fetch service by ID",
        description: "Endpoint to fetch a specific service by its unique ID",
        tags: ["Service"],
        params: z.object({
          id: z.string().uuid().describe("Unique identifier for the service"),
        }),
        response: {
          200: z.object({
            id: z.string().uuid().describe("Unique identifier for the service"),
            name: z.string().describe("Name of the service"),
            description: z
              .string()
              .nullable()
              .describe("Description of the service"),
            price: z.coerce.string().describe("Price of the service in BRL"),
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
                    .describe("Day of the week (0 - Sunday, 6 - Saturday)"),
                  startTime: z.string().describe("Start time in HH:MM format"),
                  endTime: z.string().describe("End time in HH:MM format"),
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
                    .describe("Duration of each service slot in minutes"),
                  serviceId: z
                    .string()
                    .uuid()
                    .nullable()
                    .describe("ID of the service"),
                })
              )
              .describe("List of availability schedules"),
            provider: z
              .object({
                userId: z
                  .string()
                  .uuid()
                  .describe("Unique identifier for the service provider"),
                averageRating: z.coerce
                  .string()
                  .describe("Average rating of the service provider"),
                user: z
                  .object({
                    photoUrl: z
                      .string()
                      .nullable()
                      .describe("URL of the user's profile photo"),
                    individual: z
                      .object({
                        fullName: z
                          .string()
                          .describe("Full name of the individual user"),
                      })
                      .nullable()
                      .describe("Individual user details"),
                    contacts: z
                      .array(
                        z.object({
                          type: z
                            .enum(["EMAIL", "PHONE"])
                            .describe("Type of contact (EMAIL or PHONE)"),
                          value: z.string().describe("Contact value"),
                        })
                      )
                      .describe("List of user contacts"),
                  })
                  .describe("User details"),
              })
              .describe("Service provider details"),
            category: z
              .object({
                id: z.number().describe("Unique identifier for the category"),
                name: z.string().describe("Name of the category"),
                description: z
                  .string()
                  .nullable()
                  .describe("Description of the category"),
              })
              .describe("Category details"),
          }),
        },
      },
    },
    async (request, reply) => serviceController.fetchById(request, reply)
  );

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
