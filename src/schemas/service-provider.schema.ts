import { z } from "zod";

export const createServiceProviderSchema = z.object({
  userId: z
    .string()
    .uuid()
    .describe("The ID of the user to be promoted")
    .default("550e8400-e29b-41d4-a716-446655440000"),
});
export type CreateServiceProviderDTO = z.infer<
  typeof createServiceProviderSchema
>;

export const updateServiceProviderSchema = z.object({
  autoAcceptAppointments: z
    .boolean()
    .optional()
    .describe("Whether to automatically accept appointments"),
  showContactInfo: z
    .boolean()
    .optional()
    .describe("Whether to show contact information (phone/whatsapp)"),
});
export type UpdateServiceProviderDTO = z.infer<
  typeof updateServiceProviderSchema
>;
