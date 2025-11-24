import { CategoryRepository } from "../repository/category.repository";

export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

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
}
