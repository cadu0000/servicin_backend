import z from "zod";

export const createReviewSchema = z
  .object({
    appointmentId: z
      .string()
      .uuid("O ID do agendamento deve ser um UUID válido.")
      .describe("ID do agendamento que foi concluído e pago."),
    rating: z
      .number()
      .min(1, "A avaliação deve ser no mínimo 1.")
      .max(5, "A avaliação deve ser no máximo 5.")
      .describe("Nota da avaliação (1 a 5)."),
    comment: z
      .string()
      .max(1000, "O comentário deve ter no máximo 1000 caracteres.")
      .optional()
      .describe("Comentário opcional sobre o serviço prestado."),
  })
  .refine((data) => Number.isInteger(data.rating * 2), {
    message: "A avaliação deve ser um número válido (ex: 1, 1.5, 2, 2.5, etc.).",
    path: ["rating"],
  });

export type CreateReviewDTO = z.infer<typeof createReviewSchema>;
