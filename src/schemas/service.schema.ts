import z from "zod";

export const fetchServicesQueryParamsSchema = z.object({
  page: z.coerce.number().default(1).describe("Page number for pagination"),
  pageSize: z.coerce
    .number()
    .default(12)
    .describe("Number of items per page for pagination"),
});

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

export const scheduleServiceSchema = z.object({
  serviceId: z
    .string()
    .uuid()
    .describe("ID do serviço que está sendo agendado")
    .default("550e8400-e29b-41d4-a716-446655440000"),
  providerId: z
    .string()
    .uuid()
    .describe("ID do prestador que irá realizar o serviço")
    .default("660e8400-e29b-41d4-a716-446655440000"),
  customerId: z
    .string()
    .uuid()
    .describe("ID do cliente que está agendando o serviço")
    .default("770e8400-e29b-41d4-a716-446655440000"),
  scheduledStart: z
    .string()
    .datetime()
    .describe("Data e hora de início do agendamento no formato ISO 8601")
    .default("2024-07-01T09:00:00Z"),
  scheduledEnd: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Data e hora de término do agendamento no formato ISO 8601 (opcional; pode ser calculado automaticamente)"
    )
    .default("2024-07-01T11:00:00Z"),
  categoryId: z
    .number()
    .optional()
    .describe("ID da categoria do serviço, caso aplicável")
    .default(1),
  providerServiceId: z
    .string()
    .uuid()
    .optional()
    .describe(
      "ID do vínculo provider_service, caso o agendamento use essa referência direta"
    )
    .default("880e8400-e29b-41d4-a716-446655440000"),
});


export type FetchServicesQueryParamsDTO = z.infer<
  typeof fetchServicesQueryParamsSchema
>;
export type CreateServiceSchemaDTO = z.infer<typeof createServiceSchema>;
