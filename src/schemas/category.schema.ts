import z from "zod";

export const categorySchema = z.object({
  id: z.number().describe("Unique identifier of the category. Example: 1"),

  name: z.string().describe("Category name. Example: 'Electrical Repair'"),

  description: z
    .string()
    .nullable()
    .describe(
      "Category description. Example: 'Services related to home electrical maintenance'"
    ),
});

export const fetchCategoriesResponseSchema = z.object({
  data: z.array(categorySchema).describe("List of available categories"),

  page: z.number().describe("Current page number. Example: 1"),
  pageSize: z.number().describe("Items per page. Example: 10"),
  total: z.number().describe("Total number of categories. Example: 42"),
  totalPages: z.number().describe("Total number of pages. Example: 5"),
});

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "O nome da categoria é obrigatório")
    .max(255, "O nome da categoria deve ter no máximo 255 caracteres")
    .describe("Category name. Example: 'Electrical Repair'"),
  description: z
    .string()
    .min(1, "A descrição é obrigatória")
    .max(1000, "A descrição deve ter no máximo 1000 caracteres")
    .describe(
      "Category description. Example: 'Services related to home electrical maintenance'"
    ),
});

export type fetchCategoryByIdResponseSchema = z.infer<typeof categorySchema>;
export type CategoryDTO = z.infer<typeof categorySchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
