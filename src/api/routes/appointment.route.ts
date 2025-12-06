import { FastifyInstance } from "fastify";
import {
  createAppointmentSchema,
  CreateAppointmentSchemaDTO,
  UpdateAppointmentStatusDTO,
  updateAppointmentStatusRequestBaseSchema,
  AppointmentStatus,
  cancelAppointmentSchema,
  CancelAppointmentDTO,
} from "../../schemas/appointment.shema";
import { z } from "zod";
import { appointmentController } from "../../container/index";

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
          201: z.object({
            message: z.string(),
            appointmentId: z.string().uuid(),
            status: z.string(),
          }),
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
          200: z.object({
            id: updateAppointmentStatusRequestBaseSchema.shape.appointmentId,
            status: updateAppointmentStatusRequestBaseSchema.shape.status,
          }),
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
          200: z.object({
            id: z.string().uuid(),
            status: z.nativeEnum(AppointmentStatus),
          }),
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
          200: z.object({
            id: z.string().uuid(),
            status: z.nativeEnum(AppointmentStatus),
          }),
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
          200: z.object({
            id: z.string().uuid(),
            status: z.nativeEnum(AppointmentStatus),
          }),
        },
      },
    },
    async (request, reply) =>
      appointmentController.confirmPayment(request, reply)
  );
}
