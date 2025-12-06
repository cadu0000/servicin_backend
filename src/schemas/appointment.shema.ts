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

export const createAppointmentSchema = z
  .object({
    serviceId: z
      .string()
      .uuid()
      .describe("ID do serviço a ser agendado.")
      .min(1, "O ID do serviço não pode ser vazio."),
    scheduledStartTime: z
      .preprocess(
        (arg) =>
          typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg,
        z.date().min(new Date(), "A data de agendamento deve ser futura.")
      )
      .describe("Data e hora de início solicitada para o serviço."),
    scheduledEndTime: z
      .preprocess(
        (arg) =>
          typeof arg === "string" || arg instanceof Date ? new Date(arg) : arg,
        z.date().min(new Date(), "A data de término deve ser futura.")
      )
      .describe("Data e hora de término solicitada para o serviço."),
    description: z
      .string()
      .min(20)
      .max(1000)
      .describe("Detalhamento do serviço que deve ser realizado."),
    paymentMethod: z
      .nativeEnum(PaymentMethod)
      .describe("Forma de pagamento escolhida."),
  })
  .refine((data) => data.scheduledEndTime > data.scheduledStartTime, {
    message: "A data de término deve ser posterior à data de início.",
    path: ["scheduledEndTime"],
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
