import { NotificationRepository } from "../repository/notification.repository";
import {
  CreateNotificationDTO,
  MarkAsReadDTO,
} from "../schemas/notification.schema";
import { NotificationType, AppointmentStatus } from "@prisma/client";

export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  async create(createNotificationDTO: CreateNotificationDTO) {
    const notification = await this.notificationRepository.create(
      createNotificationDTO
    );

    return notification;
  }

  async notify(
    userId: string,
    title: string,
    message: string,
    type: NotificationType,
    options?: {
      appointmentId?: string;
      reviewId?: string;
      serviceId?: string;
    }
  ) {
    const notification = await this.notificationRepository.create({
      userId,
      title,
      message,
      type,
      appointmentId: options?.appointmentId,
      reviewId: options?.reviewId,
      serviceId: options?.serviceId,
    });

    return notification;
  }

  async findByUserId(userId: string) {
    const notifications = await this.notificationRepository.findByUserId(
      userId
    );

    return notifications;
  }

  async findUnreadByUserId(userId: string) {
    const notifications = await this.notificationRepository.findUnreadByUserId(
      userId
    );

    return notifications;
  }

  async markAsRead(markAsReadDTO: MarkAsReadDTO, userId: string) {
    const notification = await this.notificationRepository.findById(
      markAsReadDTO.notificationId
    );

    if (!notification) {
      throw new Error("Notificação não encontrada.");
    }

    if (notification.userId !== userId) {
      throw new Error(
        "Você não tem permissão para marcar esta notificação como lida."
      );
    }

    await this.notificationRepository.markAsRead(
      markAsReadDTO.notificationId,
      userId
    );

    return { message: "Notificação marcada como lida." };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.markAllAsRead(userId);

    return { message: "Todas as notificações foram marcadas como lidas." };
  }

  async findById(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findById(
      notificationId
    );

    if (!notification) {
      throw new Error("Notificação não encontrada.");
    }

    if (notification.userId !== userId) {
      throw new Error(
        "Você não tem permissão para visualizar esta notificação."
      );
    }

    return notification;
  }

  async notifyAppointmentCreated(
    providerId: string,
    serviceName: string,
    appointmentId: string,
    serviceId: string,
    isAutoApproved: boolean
  ) {
    const statusMessage = isAutoApproved
      ? "foi aprovado automaticamente"
      : "foi criado e está aguardando aprovação";

    return this.notify(
      providerId,
      "Novo agendamento recebido",
      `Um novo agendamento para o serviço "${serviceName}" ${statusMessage}.`,
      NotificationType.APPOINTMENT_CREATED,
      {
        appointmentId,
        serviceId,
      }
    );
  }

  async notifyAppointmentStatusChanged(
    userId: string,
    serviceName: string,
    status: AppointmentStatus,
    appointmentId: string,
    serviceId: string
  ) {
    const statusMessages: Record<
      AppointmentStatus,
      { title: string; message: string }
    > = {
      [AppointmentStatus.APPROVED]: {
        title: "Agendamento aprovado",
        message: `O serviço "${serviceName}" foi aprovado.`,
      },
      [AppointmentStatus.REJECTED]: {
        title: "Agendamento rejeitado",
        message: `O serviço "${serviceName}" foi rejeitado.`,
      },
      [AppointmentStatus.CANCELED]: {
        title: "Agendamento cancelado",
        message: `O serviço "${serviceName}" foi cancelado.`,
      },
      [AppointmentStatus.COMPLETED]: {
        title: "Serviço concluído",
        message: `O serviço "${serviceName}" foi marcado como concluído.`,
      },
      [AppointmentStatus.PENDING]: {
        title: "Status do agendamento atualizado",
        message: `O status do serviço "${serviceName}" foi atualizado.`,
      },
    };

    const { title, message } = statusMessages[status];

    if (status !== AppointmentStatus.PENDING) {
      return this.notify(
        userId,
        title,
        message,
        NotificationType.APPOINTMENT_STATUS_CHANGED,
        {
          appointmentId,
          serviceId,
        }
      );
    }
  }

  async notifyAppointmentAutoApproved(
    clientId: string,
    serviceName: string,
    appointmentId: string,
    serviceId: string
  ) {
    return this.notify(
      clientId,
      "Agendamento aprovado",
      `Seu agendamento para o serviço "${serviceName}" foi aprovado automaticamente.`,
      NotificationType.APPOINTMENT_STATUS_CHANGED,
      {
        appointmentId,
        serviceId,
      }
    );
  }

  async notifyPaymentConfirmed(
    userId: string,
    serviceName: string,
    appointmentId: string,
    serviceId: string
  ) {
    return this.notify(
      userId,
      "Pagamento confirmado",
      `O pagamento do serviço "${serviceName}" foi confirmado.`,
      NotificationType.PAYMENT_STATUS_CHANGED,
      {
        appointmentId,
        serviceId,
      }
    );
  }

  async notifyReviewReceived(
    providerId: string,
    serviceName: string,
    reviewId: string,
    serviceId: string
  ) {
    return this.notify(
      providerId,
      "Nova avaliação recebida",
      `Você recebeu uma nova avaliação para o serviço "${serviceName}".`,
      NotificationType.REVIEW_RECEIVED,
      {
        reviewId,
        serviceId,
      }
    );
  }

  async notifyWelcome(userId: string) {
    return this.notify(
      userId,
      "Bem-vindo ao Serviçin!",
      "Sua conta foi criada com sucesso. Explore nossos serviços e comece a agendar hoje mesmo!",
      NotificationType.SYSTEM
    );
  }
}
