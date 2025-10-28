import { FastifyInstance } from "fastify";
import { PublicSearchQuerySchema } from "../../../schemas/service.schema";
import { z } from "zod";
import { serviceController } from "../../../container";

export async function servicePublicRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        summary: "Fetch all services",
        description: "Endpoint to fetch all available services",
        tags: ["Service - Public"],
        response: {
          200: z.array(
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
            })
          ),
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
        description: "Endpoint to search for services (Public Access)",
        tags: ["Service - Public"],
        querystring: PublicSearchQuerySchema,
      },
    },
    (request, reply) => serviceController.searchServicesHandler(request, reply)
  );
}
