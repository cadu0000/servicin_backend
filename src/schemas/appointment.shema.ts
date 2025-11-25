import z from "zod";

export enum AppointmentStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELED = "CANCELED",
  COMPLETED = "COMPLETED",
}

export enum PaymentMethod {
  CREDIT_CARD = "CREDIT_CARD",
  DEBIT_CARD = "DEBIT_CARD",
  CASH = "CASH",
  PIX = "PIX",
}

export const createAppointmentSchema = z.object({
  serviceId: z
    .string()
    .uuid()
    .describe("ID do serviço a ser agendado.")
    .min(1, "O ID do serviço não pode ser vazio.")
    .default("550e8400-e29b-41d4-a716-446655440000"),
  clientId: z
    .string()
    .uuid()
    .describe("ID do cliente (usuário logado).")
    .min(1, "O ID do cliente não pode ser vazio.")
    .default("550e8400-e29b-41d4-a716-446655449999"),
  scheduledAt: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg,
      z.date().min(new Date(), "A data de agendamento deve ser futura.")
    )
    .describe("Data e hora solicitada para o serviço.")
    .default("2025-12-31T10:00:00.000Z"),
  description: z
    .string()
    .min(20)
    .max(1000)
    .describe("Detalhamento do serviço que deve ser realizado.")
    .default("Detalhes do serviço a ser realizado pelo prestador."),
  paymentMethod: z
    .nativeEnum(PaymentMethod)
    .describe("Forma de pagamento escolhida.")
    .default(PaymentMethod.CREDIT_CARD),
});

export const updateAppointmentStatusRequestSchema = z.object({
  appointmentId: z
    .string()
    .uuid()
    .describe("ID do agendamento a ser atualizado.")
    .min(1, "O ID do agendamento não pode ser vazio.")
    .default("660e8400-e29b-41d4-a716-446655440000"),
  status: z
    .nativeEnum(AppointmentStatus)
    .describe("Novo status do agendamento.")
    .default(AppointmentStatus.APPROVED),
});

export type UpdateAppointmentStatusDTO = z.infer<
  typeof updateAppointmentStatusRequestSchema
>;

export type CreateAppointmentSchemaDTO = z.infer<
  typeof createAppointmentSchema
>;
