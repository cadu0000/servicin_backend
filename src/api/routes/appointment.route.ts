import { FastifyInstance } from "fastify";
import {
  createAppointmentSchema,
  CreateAppointmentSchemaDTO,
  UpdateAppointmentStatusDTO,
  updateAppointmentStatusRequestBaseSchema,
  AppointmentStatus,
  cancelAppointmentSchema,
  CancelAppointmentDTO,
  appointmentResponseSchema,
  appointmentWithClientResponseSchema,
} from "../../schemas/appointment.shema";
import { z } from "zod";
import { appointmentController } from "../../container/index";
import { createApiResponseSchema, createErrorResponseSchema } from "../../utils/response";

type CreateAppointmentRouteRequest = {
  Body: CreateAppointmentSchemaDTO;
};

type UpdateAppointmentStatusRouteRequest = {
  Params: { appointmentId: UpdateAppointmentStatusDTO["appointmentId"] };
  Body: {
    status: UpdateAppointmentStatusDTO["status"];
    reason?: UpdateAppointmentStatusDTO["reason"];
  };
};

type CancelAppointmentRouteRequest = {
  Params: { appointmentId: string };
  Body: CancelAppointmentDTO;
};

type CompleteServiceRouteRequest = {
  Params: { appointmentId: string };
};

type ConfirmPaymentRouteRequest = {
  Params: { appointmentId: string };
};

export async function appointmentRoutes(server: FastifyInstance) {
  server.post<CreateAppointmentRouteRequest>(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Create scheduling request",
        description:
          "Create a service scheduling request. Requires authentication.",
        tags: ["Appointment"],
        body: createAppointmentSchema,
        response: {
          201: createApiResponseSchema(
            z.object({
              appointmentId: z.string().uuid(),
              status: z.string(),
            })
          ),
          400: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => appointmentController.create(request, reply)
  );

  server.patch<UpdateAppointmentStatusRouteRequest>(
    "/:appointmentId/status",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Update appointment status",
        description:
          "Update the status (e.g., CONFIRMED, CANCELED) of an existing appointment. Requires authentication.",
        tags: ["Appointment"],
        params: z.object({
          appointmentId:
            updateAppointmentStatusRequestBaseSchema.shape.appointmentId,
        }),
        body: updateAppointmentStatusRequestBaseSchema
          .omit({
            appointmentId: true,
          })
          .refine(
            (data) => {
              if (data.status === AppointmentStatus.CANCELED) {
                return (
                  data.reason !== undefined && data.reason.trim().length > 0
                );
              }
              return true;
            },
            {
              message:
                "O motivo do cancelamento é obrigatório quando o status é CANCELED.",
              path: ["reason"],
            }
          ),
        response: {
          200: createApiResponseSchema(
            z.object({
              id: updateAppointmentStatusRequestBaseSchema.shape.appointmentId,
              status: updateAppointmentStatusRequestBaseSchema.shape.status,
            })
          ),
          400: createErrorResponseSchema(),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => appointmentController.updateStatus(request, reply)
  );

  server.patch<CancelAppointmentRouteRequest>(
    "/:appointmentId/cancel",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Cancel appointment",
        description:
          "Cancel an appointment. Only the client or provider of the appointment can cancel it. Requires authentication.",
        tags: ["Appointment"],
        params: z.object({
          appointmentId: z.string().uuid(),
        }),
        body: cancelAppointmentSchema,
        response: {
          200: createApiResponseSchema(
            z.object({
              id: z.string().uuid(),
              status: z.nativeEnum(AppointmentStatus),
            })
          ),
          400: createErrorResponseSchema(),
          403: createErrorResponseSchema(),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => appointmentController.cancel(request, reply)
  );

  server.patch<CompleteServiceRouteRequest>(
    "/:appointmentId/complete-service",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Complete service",
        description:
          "Mark an appointment service as completed. Only the client or provider of the appointment can complete it. Requires authentication.",
        tags: ["Appointment"],
        params: z.object({
          appointmentId: z.string().uuid(),
        }),
        response: {
          200: createApiResponseSchema(
            z.object({
              id: z.string().uuid(),
              status: z.nativeEnum(AppointmentStatus),
            })
          ),
          400: createErrorResponseSchema(),
          403: createErrorResponseSchema(),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) =>
      appointmentController.completeService(request, reply)
  );

  server.patch<ConfirmPaymentRouteRequest>(
    "/:appointmentId/confirm-payment",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Confirm payment",
        description:
          "Confirm payment for a completed service. Only the client or provider can confirm payment. For CASH payments, only the provider can confirm. Requires authentication.",
        tags: ["Appointment"],
        params: z.object({
          appointmentId: z.string().uuid(),
        }),
        response: {
          200: createApiResponseSchema(
            z.object({
              id: z.string().uuid(),
              status: z.nativeEnum(AppointmentStatus),
            })
          ),
          400: createErrorResponseSchema(),
          403: createErrorResponseSchema(),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) =>
      appointmentController.confirmPayment(request, reply)
  );

  server.get(
    "/my-appointments",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Get my appointments",
        description:
          "Get all appointments made by the authenticated user as a client. Requires authentication.",
        tags: ["Appointment"],
        response: {
          200: createApiResponseSchema(
            z.array(appointmentResponseSchema)
          ),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) =>
      appointmentController.getMyAppointments(request, reply)
  );

  server.get(
    "/received",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Get received appointments",
        description:
          "Get all appointments received by the authenticated user as a service provider. Requires authentication.",
        tags: ["Appointment"],
        response: {
          200: createApiResponseSchema(
            z.array(appointmentWithClientResponseSchema)
          ),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) =>
      appointmentController.getReceivedAppointments(request, reply)
  );
}
