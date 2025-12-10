import { FastifyInstance } from "fastify";
import z from "zod";
import {
  categorySchema,
  createCategorySchema,
} from "../../schemas/category.schema";
import { categoryController } from "../../container";
import {
  createApiResponseSchema,
  createErrorResponseSchema,
} from "../../utils/response";

export async function categoryRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        summary: "Fetch all categories",
        description: "Endpoint to fetch all available service categories",
        tags: ["Categories"],
        response: {
          200: createApiResponseSchema(z.array(categorySchema)),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => categoryController.getAllCategories(reply)
  );

  server.get(
    "/:id",
    {
      schema: {
        summary: "Fetch category by ID",
        description: "Endpoint to fetch a specific category by its unique ID",
        tags: ["Categories"],
        params: z.object({
          id: z.coerce
            .number()
            .int()
            .describe("Unique identifier for the category. Example: 1"),
        }),
        response: {
          200: createApiResponseSchema(categorySchema),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => categoryController.getCategoryById(request, reply)
  );

  server.post(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Create a new category",
        description:
          "Endpoint to create a new service category. Requires authentication and service provider role.",
        tags: ["Categories"],
        body: createCategorySchema,
        response: {
          201: createApiResponseSchema(categorySchema),
          403: createErrorResponseSchema(),
          409: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => categoryController.create(request, reply)
  );
}
