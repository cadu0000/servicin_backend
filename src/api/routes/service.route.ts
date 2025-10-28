import { FastifyInstance } from "fastify";
import {
  createServiceSchema,
  fetchServicesQueryParamsSchema,
} from "../../schemas/service.schema";
import { z } from "zod";
import { serviceController } from "../../container";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        summary: "Fetch all services",
        description: "Endpoint to fetch all available services",
        tags: ["Services"],
        querystring: fetchServicesQueryParamsSchema,
        response: {
          200: z.object({
            data: z.array(
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
                      photoUrl: z.string().url().describe("URL of the photo"),
                    })
                  )
                  .describe("List of photos associated with the service"),
                providers: z
                  .array(
                    z.object({
                      category: z
                        .object({
                          id: z
                            .number()
                            .describe("Unique identifier for the category"),
                          name: z.string().describe("Name of the category"),
                        })
                        .describe("Category details"),
                      provider: z
                        .object({
                          user: z
                            .object({
                              id: z
                                .string()
                                .uuid()
                                .describe("Unique identifier for the user"),
                              email: z
                                .string()
                                .email()
                                .describe("Email of the user"),
                            })
                            .describe("User details"),
                        })
                        .describe("Provider details"),
                      createdAt: z
                        .date()
                        .describe("Timestamp when the service was created"),
                      updatedAt: z
                        .date()
                        .nullable()
                        .describe(
                          "Timestamp when the service was last updated"
                        ),
                      finishedAt: z
                        .date()
                        .nullable()
                        .describe(
                          "Timestamp when the service was finished, null if not finished"
                        ),
                    })
                  )
                  .describe("List of providers associated with the service"),
              })
            ),
            page: z.number().describe("Current page number"),
            pageSize: z.number().describe("Number of items per page"),
            total: z.number().describe("Total number of services available"),
            totalPages: z.number().describe("Total number of pages available"),
          }),
        },
      },
    },
    async (request, reply) => serviceController.fetch(request, reply)
  );

  server.get(
    "/:id",
    {
      schema: {
        summary: "Fetch service by ID",
        description: "Endpoint to fetch a specific service by its unique ID",
        tags: ["Services"],
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
                  photoUrl: z.string().url().describe("URL of the photo"),
                })
              )
              .describe("List of photos associated with the service"),
            providers: z
              .array(
                z.object({
                  category: z
                    .object({
                      id: z
                        .number()
                        .describe("Unique identifier for the category"),
                      name: z.string().describe("Name of the category"),
                    })
                    .describe("Category details"),
                  provider: z
                    .object({
                      user: z
                        .object({
                          id: z
                            .string()
                            .uuid()
                            .describe("Unique identifier for the user"),
                          email: z
                            .string()
                            .email()
                            .describe("Email of the user"),
                        })
                        .describe("User details"),
                    })
                    .describe("Provider details"),
                  createdAt: z
                    .date()
                    .describe("Timestamp when the service was created"),
                  updatedAt: z
                    .date()
                    .nullable()
                    .describe("Timestamp when the service was last updated"),
                  finishedAt: z
                    .date()
                    .nullable()
                    .describe(
                      "Timestamp when the service was finished, null if not finished"
                    ),
                })
              )
              .describe("List of providers associated with the service"),
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
        tags: ["Services"],
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
