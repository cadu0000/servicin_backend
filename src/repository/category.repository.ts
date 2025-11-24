import { prisma } from "../lib/prisma";

export class CategoryRepository {
    async fetchAll() {
        const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            description: true
        },
        orderBy: {
            name: "asc",
        },
        });

        return categories;
    }

    async fetchById(categoryId: number) {
        const category = await prisma.category.findUnique({
        where: {
            id: categoryId,
        },
        });
        return category;
  }
}