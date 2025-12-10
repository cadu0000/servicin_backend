import { FastifyRequest, FastifyReply } from "fastify";
import { CategoryService } from "../../services/category.service";
import { createCategorySchema } from "../../schemas/category.schema";
import type { UserPayload } from "../../@types/fastify";
import { sendSuccess, sendError } from "../../utils/response";

export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async getAllCategories(reply: FastifyReply) {
    try {
      const categories = await this.categoryService.getAllCategories();
      return sendSuccess(reply, categories);
    } catch (error) {
      return sendError(reply, "Erro ao buscar categorias", 500);
    }
  }

  async getCategoryById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: number };
      const category = await this.categoryService.getCategoryById(id);
      return sendSuccess(reply, category);
    } catch (error) {
      const message = (error as Error).message;

      if (message === "400.") {
        return sendError(reply, message, 400);
      }

      if (message === "404") {
        return sendError(reply, "Categoria não encontrada", 404);
      }

      return sendError(reply, "Erro inesperado", 500);
    }
  }

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { sub: userId } = request.user as UserPayload;
      const params = createCategorySchema.parse(request.body);
      const category = await this.categoryService.create(params, userId);
      return sendSuccess(reply, category, "Categoria criada com sucesso", 201);
    } catch (error) {
      const message = (error as Error).message;

      if (message === "Nome da categoria já existe") {
        return sendError(reply, "Nome da categoria já existe", 409);
      }

      if (message === "Apenas prestadores de serviços podem criar categorias") {
        return sendError(reply, "Apenas prestadores de serviços podem criar categorias", 403);
      }

      return sendError(reply, "Erro inesperado", 500);
    }
  }
}
