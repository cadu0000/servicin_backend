import { prisma } from "../lib/prisma";
import { NotificationType } from "@prisma/client";

type CreateNotificationData = {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
  reviewId?: string;
  serviceId?: string;
};

export class NotificationRepository {
  async create(createNotificationData: CreateNotificationData) {
    const notification = await prisma.notification.create({
      data: {
        userId: createNotificationData.userId,
        title: createNotificationData.title,
        message: createNotificationData.message,
        type: createNotificationData.type,
        appointmentId: createNotificationData.appointmentId || null,
        reviewId: createNotificationData.reviewId || null,
        serviceId: createNotificationData.serviceId || null,
      },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        review: {
          select: {
            id: true,
            serviceId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return notification;
  }

  async findByUserId(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        review: {
          select: {
            id: true,
            serviceId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  }

  async findUnreadByUserId(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        review: {
          select: {
            id: true,
            serviceId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return result;
  }

  async findById(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
      include: {
        appointment: {
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        review: {
          select: {
            id: true,
            serviceId: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return notification;
  }
}
