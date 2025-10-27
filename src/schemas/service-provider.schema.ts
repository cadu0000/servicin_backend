import { z } from "zod";

export const createServiceProviderSchema = z.object({
  userId: z
    .string()
    .uuid()
    .describe("The ID of the user to be promoted")
    .default("550e8400-e29b-41d4-a716-446655440000"),
  serviceDescription: z
    .string()
    .nullable()
    .describe("Description of the service provided"),
  averageRating: z
    .number()
    .min(0)
    .max(5)
    .describe("Average rating of the service provider")
    .default(4.5),
});

export type CreateServiceProviderDTO = z.infer<
  typeof createServiceProviderSchema
>;
