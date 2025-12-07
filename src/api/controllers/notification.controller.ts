import { FastifyReply, FastifyRequest } from "fastify";
import { NotificationService } from "../../services/notification.service";
import { markAsReadSchema } from "../../schemas/notification.schema";
import type { UserPayload } from "../../@types/fastify";

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

      return res.status(200).send({
        notifications,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[API] Error fetching notifications: ${error.message}`);
        return res.status(500).send({
          message: "Falha ao buscar notificações.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      console.error("[API] Internal Error during notifications fetch:", error);
      return res.status(500).send({
        message: "Falha interna ao processar a requisição.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  async findUnread(req: FastifyRequest, res: FastifyReply) {
    const { sub: userId } = req.user as UserPayload;

    try {
      const notifications = await this.notificationService.findUnreadByUserId(
        userId
      );

      return res.status(200).send({
        notifications,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(
          `[API] Error fetching unread notifications: ${error.message}`
        );
        return res.status(500).send({
          message: "Falha ao buscar notificações não lidas.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      console.error(
        "[API] Internal Error during unread notifications fetch:",
        error
      );
      return res.status(500).send({
        message: "Falha interna ao processar a requisição.",
        code: "INTERNAL_SERVER_ERROR",
      });
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

      return res.status(200).send({
        notification,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("não encontrada")) {
          return res.status(404).send({
            message: error.message,
            code: "NOT_FOUND",
          });
        }

        if (error.message.includes("permissão")) {
          return res.status(403).send({
            message: error.message,
            code: "FORBIDDEN",
          });
        }

        return res.status(400).send({
          message: error.message,
          code: "INVALID_INPUT",
        });
      }

      console.error("[API] Internal Error during notification fetch:", error);
      return res.status(500).send({
        message: "Falha interna ao processar a requisição.",
        code: "INTERNAL_SERVER_ERROR",
      });
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

      return res.status(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("não encontrada")) {
          return res.status(404).send({
            message: error.message,
            code: "NOT_FOUND",
          });
        }

        if (error.message.includes("permissão")) {
          return res.status(403).send({
            message: error.message,
            code: "FORBIDDEN",
          });
        }

        return res.status(400).send({
          message: error.message,
          code: "INVALID_INPUT",
        });
      }

      console.error("[API] Internal Error during mark as read:", error);
      return res.status(500).send({
        message: "Falha interna ao processar a requisição.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }

  async markAllAsRead(req: FastifyRequest, res: FastifyReply) {
    const { sub: userId } = req.user as UserPayload;

    try {
      const result = await this.notificationService.markAllAsRead(userId);

      return res.status(200).send(result);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[API] Error marking all as read: ${error.message}`);
        return res.status(500).send({
          message: "Falha ao marcar todas as notificações como lidas.",
          code: "INTERNAL_SERVER_ERROR",
        });
      }

      console.error("[API] Internal Error during mark all as read:", error);
      return res.status(500).send({
        message: "Falha interna ao processar a requisição.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
}
