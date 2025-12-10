import { FastifyReply, FastifyRequest } from "fastify";
import { NotificationService } from "../../services/notification.service";
import { markAsReadSchema } from "../../schemas/notification.schema";
import type { UserPayload } from "../../@types/fastify";
import { sendSuccess, sendError } from "../../utils/response";

type MarkAsReadRequest = FastifyRequest<{
  Params: {
    id: string;
  };
}>;

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  async findAll(req: FastifyRequest, res: FastifyReply) {
    const { sub: userId } = req.user as UserPayload;

    try {
      const notifications = await this.notificationService.findByUserId(userId);

      return sendSuccess(res, notifications);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[API] Error fetching notifications: ${error.message}`);
        return sendError(res, "Falha ao buscar notificações.", 500);
      }

      console.error("[API] Internal Error during notifications fetch:", error);
      return sendError(res, "Falha interna ao processar a requisição.", 500);
    }
  }

  async findUnread(req: FastifyRequest, res: FastifyReply) {
    const { sub: userId } = req.user as UserPayload;

    try {
      const notifications = await this.notificationService.findUnreadByUserId(
        userId
      );

      return sendSuccess(res, notifications);
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `[API] Error fetching unread notifications: ${error.message}`
        );
        return sendError(res, "Falha ao buscar notificações não lidas.", 500);
      }

      console.error(
        "[API] Internal Error during unread notifications fetch:",
        error
      );
      return sendError(res, "Falha interna ao processar a requisição.", 500);
    }
  }

  async findById(req: MarkAsReadRequest, res: FastifyReply) {
    const { id: notificationId } = req.params;
    const { sub: userId } = req.user as UserPayload;

    try {
      const notification = await this.notificationService.findById(
        notificationId,
        userId
      );

      return sendSuccess(res, notification);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("não encontrada")) {
          return sendError(res, error.message, 404);
        }

        if (error.message.includes("permissão")) {
          return sendError(res, error.message, 403);
        }

        return sendError(res, error.message, 400);
      }

      console.error("[API] Internal Error during notification fetch:", error);
      return sendError(res, "Falha interna ao processar a requisição.", 500);
    }
  }

  async markAsRead(req: MarkAsReadRequest, res: FastifyReply) {
    const { id: notificationId } = req.params;
    const { sub: userId } = req.user as UserPayload;

    try {
      const markAsReadDTO = markAsReadSchema.parse({ notificationId });
      const result = await this.notificationService.markAsRead(
        markAsReadDTO,
        userId
      );

      return sendSuccess(res, result, "Notificação marcada como lida");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("não encontrada")) {
          return sendError(res, error.message, 404);
        }

        if (error.message.includes("permissão")) {
          return sendError(res, error.message, 403);
        }

        return sendError(res, error.message, 400);
      }

      console.error("[API] Internal Error during mark as read:", error);
      return sendError(res, "Falha interna ao processar a requisição.", 500);
    }
  }

  async markAllAsRead(req: FastifyRequest, res: FastifyReply) {
    const { sub: userId } = req.user as UserPayload;

    try {
      const result = await this.notificationService.markAllAsRead(userId);

      return sendSuccess(res, result, "Todas as notificações foram marcadas como lidas");
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[API] Error marking all as read: ${error.message}`);
        return sendError(res, "Falha ao marcar todas as notificações como lidas.", 500);
      }

      console.error("[API] Internal Error during mark all as read:", error);
      return sendError(res, "Falha interna ao processar a requisição.", 500);
    }
  }
}
