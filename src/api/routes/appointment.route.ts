import { FastifyInstance } from "fastify";
import {
  createAppointmentSchema,
  CreateAppointmentSchemaDTO,
  UpdateAppointmentStatusDTO,
  updateAppointmentStatusRequestSchema,
} from "../../schemas/appointment.shema";
import { z } from "zod";
import { appointmentController } from "../../container/index";

type CreateAppointmentRouteRequest = {
  Body: CreateAppointmentSchemaDTO;
};

type UpdateAppointmentStatusRouteRequest = {
  Params: { appointmentId: UpdateAppointmentStatusDTO["appointmentId"] };
  Body: { status: UpdateAppointmentStatusDTO["status"] };
};

export async function appointmentRoutes(server: FastifyInstance) {
  server.post<CreateAppointmentRouteRequest>(
    "/",
    {
      schema: {
        summary: "Create scheduling request",
        description: "Create a service scheduling request",
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
      schema: {
        summary: "Update appointment status",
        description: "Update the status (e.g., CONFIRMED, CANCELED) of an existing appointment.",
        tags: ["Appointment"],
        params: z.object({
            appointmentId: updateAppointmentStatusRequestSchema.shape.appointmentId,
        }),
        body: z.object({ 
            status: updateAppointmentStatusRequestSchema.shape.status,
        }),
        response: {
          200: z.object({
            id: z.string().uuid(),
            status: z.string(), 
          }),
        },
      },
    },
    async (request, reply) => appointmentController.updateStatus(request, reply)
  );
}
