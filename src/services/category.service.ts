import { CategoryRepository } from "../repository/category.repository";
import { CreateCategoryDTO } from "../schemas/category.schema";
import { AuthRepository } from "../repository/auth.repository";

export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async getAllCategories() {
    return this.categoryRepository.fetchAll();
  }

  async getCategoryById(categoryId: number) {
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      throw new Error("400");
    }

    const category = await this.categoryRepository.fetchById(categoryId);

    if (!category) {
      throw new Error("404");
    }

    return category;
  }

  async create(createCategoryDTO: CreateCategoryDTO, userId: string) {
    const isServiceProvider = await this.authRepository.isServiceProvider(
      userId
    );

    if (!isServiceProvider) {
      throw new Error("Apenas prestadores de serviços podem criar categorias");
    }

    const existingCategory = await this.categoryRepository.findByName(
      createCategoryDTO.name
    );

    if (existingCategory) {
      throw new Error("Nome da categoria já existe");
    }

    const category = await this.categoryRepository.create({
      name: createCategoryDTO.name,
      description: createCategoryDTO.description,
    });

    return category;
  }
}
