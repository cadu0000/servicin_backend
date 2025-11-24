import { FastifyInstance } from "fastify";
import z from "zod";
import { categorySchema } from "../../schemas/category.schema";
import { categoryController } from "../../container";

export async function categoryRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        summary: "Fetch all categories",
        description: "Endpoint to fetch all available service categories",
        tags: ["Categories"],
        response: {
          200: z
            .array(categorySchema)
            .describe("List of all registered categories"),
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
          200: categorySchema,
          404: z.object({
            message: z.string().describe("Error message"),
          }),
        },
      },
    },
    async (request, reply) => categoryController.getCategoryById(request, reply)
  );
}
