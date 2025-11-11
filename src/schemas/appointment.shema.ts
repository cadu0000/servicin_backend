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
  serviceId: z.string().uuid().describe("ID do serviço a ser agendado."),
  clientId: z
    .string()
    .uuid()
    .describe("ID do cliente (usuário logado).")
    .default("550e8400-e29b-41d4-a716-446655449999"),

  scheduledAt: z
    .preprocess(
      (arg) =>
        typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg,
      z.date().min(new Date(), "A data de agendamento deve ser futura.")
    )
    .describe("Data e hora solicitada para o serviço."),

  description: z
    .string()
    .min(20)
    .max(1000)
    .describe("Detalhamento do serviço que deve ser realizado."),
  paymentMethod: z
    .nativeEnum(PaymentMethod)
    .describe("Forma de pagamento escolhida."),
});

export type CreateAppointmentSchemaDTO = z.infer<
  typeof createAppointmentSchema
>;
