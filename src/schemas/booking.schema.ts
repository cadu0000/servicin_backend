import z from "zod";

export const createBookingSchema = z.object({
  serviceId: z
    .string()
    .uuid()
    .describe("ID do serviço que está sendo reservado")
    .default("550e8400-e29b-41d4-a716-446655440000"),
  customerId: z
    .string()
    .uuid()
    .describe("ID do cliente que está fazendo a reserva")
    .default("770e8400-e29b-41d4-a716-446655440000"),
  scheduledStart: z
    .string()
    .datetime()
    .describe("Data e hora do agendamento no formato ISO 8601")
    .default("2025-11-25T10:00:00Z"),
  status: z
    .enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"])
    .default("PENDING")
    .describe("Status atual do agendamento"),
  notes: z
    .string()
    .max(500)
    .optional()
    .describe("Notas ou observações adicionais sobre o agendamento"),
});

export const bookingResponseSchema = z.object({
  id: z.string().uuid(),
  clientId: z.string().uuid(),
  providerId: z.string().uuid(),
  serviceId: z.string().uuid(),
  dateTime: z.string().datetime(),
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED"]),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type CreateBookingDTO = z.infer<typeof createBookingSchema>;
export type ResponseBookingDTO = z.infer<typeof bookingResponseSchema>;