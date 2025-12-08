import { FastifyInstance } from "fastify";
import { z } from "zod";
import { notificationController } from "../../container/index";

const notificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.string(),
  read: z.boolean(),
  appointmentId: z.string().uuid().nullable(),
  reviewId: z.string().uuid().nullable(),
  serviceId: z.string().uuid().nullable(),
  createdAt: z.date(),
  appointment: z
    .object({
      id: z.string().uuid(),
      service: z
        .object({
          id: z.string().uuid(),
          name: z.string(),
        })
        .nullable(),
    })
    .nullable(),
  review: z
    .object({
      id: z.string().uuid(),
      serviceId: z.string().uuid(),
    })
    .nullable(),
  service: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
    })
    .nullable(),
});

export async function notificationRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Get all notifications",
        description:
          "Get all notifications for the authenticated user. Requires authentication.",
        tags: ["Notification"],
        response: {
          200: z.object({
            notifications: z.array(notificationSchema),
          }),
        },
      },
    },
    async (request, reply) => notificationController.findAll(request, reply)
  );

  server.get(
    "/unread",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Get unread notifications",
        description:
          "Get all unread notifications for the authenticated user. Requires authentication.",
        tags: ["Notification"],
        response: {
          200: z.object({
            notifications: z.array(notificationSchema),
          }),
        },
      },
    },
    async (request, reply) => notificationController.findUnread(request, reply)
  );

  server.get(
    "/:id",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Get notification by ID",
        description:
          "Get a specific notification by ID. Requires authentication.",
        tags: ["Notification"],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            notification: notificationSchema,
          }),
        },
      },
    },
    async (request, reply) =>
      notificationController.findById(request as any, reply)
  );

  server.patch(
    "/:id/read",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Mark notification as read",
        description:
          "Mark a specific notification as read. Requires authentication.",
        tags: ["Notification"],
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) =>
      notificationController.markAsRead(request as any, reply)
  );

  server.patch(
    "/read-all",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Mark all notifications as read",
        description:
          "Mark all notifications as read for the authenticated user. Requires authentication.",
        tags: ["Notification"],
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) =>
      notificationController.markAllAsRead(request, reply)
  );
}
