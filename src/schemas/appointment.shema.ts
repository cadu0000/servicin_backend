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

export const updateAppointmentStatusRequestBaseSchema = z.object({
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
  reason: z
    .string()
    .optional()
    .describe("Motivo do cancelamento (obrigatório quando status é CANCELED)."),
});

export const updateAppointmentStatusRequestSchema =
  updateAppointmentStatusRequestBaseSchema.refine(
    (data) => {
      if (data.status === AppointmentStatus.CANCELED) {
        return data.reason !== undefined && data.reason.trim().length > 0;
      }
      return true;
    },
    {
      message:
        "O motivo do cancelamento é obrigatório quando o status é CANCELED.",
      path: ["reason"],
    }
  );

export const cancelAppointmentSchema = z.object({
  reason: z
    .string()
    .min(1, "O motivo do cancelamento é obrigatório.")
    .describe("Motivo do cancelamento."),
});

export type UpdateAppointmentStatusDTO = z.infer<
  typeof updateAppointmentStatusRequestSchema
>;

export type CreateAppointmentSchemaDTO = z.infer<
  typeof createAppointmentSchema
>;

export type CancelAppointmentDTO = z.infer<typeof cancelAppointmentSchema>;

export const appointmentResponseSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  scheduledStartTime: z.coerce.date(),
  scheduledEndTime: z.coerce.date(),
  status: z.nativeEnum(AppointmentStatus),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentStatus: z.enum(["PENDING", "PAID", "CANCELED"]),
  price: z.coerce.number(),
  cancellationReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  service: z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.coerce.number(),
    rating: z.coerce.number(),
    photos: z.array(
      z.object({
        id: z.string().uuid(),
        photoUrl: z.string(),
      })
    ),
    provider: z.object({
      userId: z.string().uuid(),
      averageRating: z.coerce.number(),
      user: z.object({
        photoUrl: z.string().nullable(),
        individual: z
          .object({
            fullName: z.string(),
          })
          .nullable(),
        company: z
          .object({
            tradeName: z.string().nullable(),
            corporateName: z.string(),
          })
          .nullable(),
        contacts: z.array(
          z.object({
            type: z.enum(["EMAIL", "PHONE"]),
            value: z.string(),
          })
        ),
      }),
    }),
    category: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }),
});

export const appointmentWithClientResponseSchema = z.object({
  id: z.string().uuid(),
  description: z.string(),
  scheduledStartTime: z.coerce.date(),
  scheduledEndTime: z.coerce.date(),
  status: z.nativeEnum(AppointmentStatus),
  paymentMethod: z.nativeEnum(PaymentMethod),
  paymentStatus: z.enum(["PENDING", "PAID", "CANCELED"]),
  price: z.coerce.number(),
  cancellationReason: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  client: z.object({
    id: z.string().uuid(),
    photoUrl: z.string().nullable(),
    individual: z
      .object({
        fullName: z.string(),
      })
      .nullable(),
    company: z
      .object({
        tradeName: z.string().nullable(),
        corporateName: z.string(),
      })
      .nullable(),
    contacts: z.array(
      z.object({
        type: z.enum(["EMAIL", "PHONE"]),
        value: z.string(),
      })
    ),
  }),
  service: z.object({
    id: z.string().uuid(),
    name: z.string(),
    description: z.string().nullable(),
    price: z.coerce.number(),
    rating: z.coerce.number(),
    photos: z.array(
      z.object({
        id: z.string().uuid(),
        photoUrl: z.string(),
      })
    ),
    category: z.object({
      id: z.number(),
      name: z.string(),
    }),
  }),
});
