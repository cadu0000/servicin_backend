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
                                contacts: z
                                  .array(
                                    z.object({
                                      type: z
                                        .string()
                                        .describe(
                                          "Type of contact (e.g., phone, email)"
                                        ),
                                      value: z
                                        .string()
                                        .describe("Contact value"),
                                    })
                                  )
                                  .describe("List of user contacts"),
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
                          contacts: z.array(
                            z.object({
                              type: z
                                .string()
                                .describe(
                                  "Type of contact (e.g., phone, email)"
                                ),
                              value: z.string().describe("Contact value"),
                            })
                          ),
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
