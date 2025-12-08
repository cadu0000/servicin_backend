import z from "zod";
import { NotificationType } from "@prisma/client";

export const createNotificationSchema = z
  .object({
    userId: z.string().uuid("O ID do usuário deve ser um UUID válido."),
    title: z
      .string()
      .min(1, "O título é obrigatório.")
      .max(255, "O título deve ter no máximo 255 caracteres."),
    message: z
      .string()
      .min(1, "A mensagem é obrigatória.")
      .max(1000, "A mensagem deve ter no máximo 1000 caracteres."),
    type: z.nativeEnum(NotificationType).default(NotificationType.SYSTEM),
    appointmentId: z
      .string()
      .uuid("O ID do agendamento deve ser um UUID válido.")
      .optional(),
    reviewId: z
      .string()
      .uuid("O ID da avaliação deve ser um UUID válido.")
      .optional(),
    serviceId: z
      .string()
      .uuid("O ID do serviço deve ser um UUID válido.")
      .optional(),
  })
  .refine(
    (data) => {
      const hasRelation = data.appointmentId || data.reviewId || data.serviceId;
      return hasRelation || data.type === NotificationType.SYSTEM;
    },
    {
      message:
        "Notificações de sistema não requerem relacionamentos. Outros tipos devem ter pelo menos um relacionamento.",
    }
  );

export type CreateNotificationDTO = z.infer<typeof createNotificationSchema>;

export const markAsReadSchema = z.object({
  notificationId: z
    .string()
    .uuid("O ID da notificação deve ser um UUID válido."),
});

export type MarkAsReadDTO = z.infer<typeof markAsReadSchema>;
