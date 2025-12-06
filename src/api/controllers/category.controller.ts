import { FastifyRequest, FastifyReply } from "fastify";
import { CategoryService } from "../../services/category.service";
import { createCategorySchema } from "../../schemas/category.schema";
import type { UserPayload } from "../../@types/fastify";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async getAllCategories(reply: FastifyReply) {
    const categories = await this.categoryService.getAllCategories();
    return reply.code(200).send(categories);
  }

  async getCategoryById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: number };

    try {
      const category = await this.categoryService.getCategoryById(id);
      return reply.code(200).send(category);
    } catch (error) {
      const message = (error as Error).message;

      if (message === "400.") {
        return reply.code(400).send({
          statusCode: 400,
          error: "Bad Request",
          message,
        });
      }

      if (message === "404") {
        return reply.code(404).send({
          statusCode: 404,
          error: "Not Found",
          message,
        });
      }

      return reply.code(500).send({
        statusCode: 500,
        error: "Internal Server Error",
        message: "Unexpected error.",
      });
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sub: userId } = request.user as UserPayload;
      const params = createCategorySchema.parse(request.body);
      const category = await this.categoryService.create(params, userId);
      return reply.code(201).send(category);
    } catch (error) {
      const message = (error as Error).message;

      if (message === "Category name already exists") {
        return reply.code(409).send({
          statusCode: 409,
          error: "Conflict",
          message: "Category name already exists",
        });
      }

      if (message === "Only service providers can create categories") {
        return reply.code(403).send({
          statusCode: 403,
          error: "Forbidden",
          message: "Only service providers can create categories",
        });
      }

      return reply.code(500).send({
        statusCode: 500,
        error: "Internal Server Error",
        message: "Unexpected error.",
      });
    }
  }
}
