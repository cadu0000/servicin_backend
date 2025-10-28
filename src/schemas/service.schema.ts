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
    .describe("Price of the service in BRL")
    .default(99.99),
});

export const PublicSearchQuerySchema = z.object({
  q: z.string().optional().describe("Unique service ID"),
  providerName: z.string().optional().describe("Service Provider Name"),
  axis: z.string().optional().describe("Service axis"),
  chargeType: z.string().optional().describe("Billing type"),

  minPrice: z.coerce
    .number()
    .min(0)
    .optional()
    .describe("Minimum price the solicitor is willing to pay"),
  maxPrice: z.coerce
    .number()
    .min(0)
    .optional()
    .describe("Maximum price the solicitor is willing to pay"),
  minRating: z.coerce
    .number()
    .min(0)
    .max(5)
    .optional()
    .describe("Average rating of services provided (1.0 to 5.0)"),

  latitude: z.coerce.number().optional().describe("Location latitude"),
  longitude: z.coerce.number().optional().describe("Location longitude"),
  radiusKm: z.coerce
    .number()
    .min(1)
    .optional()
    .describe("Square kilometer radio"),
});

export type PublicSearchQueryType = z.infer<typeof PublicSearchQuerySchema>;
export type CreateServiceSchemaDTO = z.infer<typeof createServiceSchema>;
