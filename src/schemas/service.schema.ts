import z from "zod";

export const createServiceSchema = z.object({
  providerId: z
    .string()
    .uuid()
    .describe("ID of the service provider")
    .default("550e8400-e29b-41d4-a716-446655440000"),
  categoryId: z.number().describe("ID of the service category").default(1),
  name: z
    .string()
    .min(3)
    .max(100)
    .describe("Name of the service")
    .default("Standard Cleaning"),
  description: z
    .string()
    .max(500)
    .describe("Description of the service")
    .default("A comprehensive cleaning service for residential properties."),
  price: z
    .number()
    .min(0)
    .describe("Price of the service in USD")
    .default(99.99),
});

export type CreateServiceSchemaDTO = z.infer<typeof createServiceSchema>;
