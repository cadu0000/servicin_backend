import { FastifyInstance } from "fastify";
import {
  createAppointmentSchema,
  CreateAppointmentSchemaDTO,
} from "../../schemas/appointment.shema";
import { z } from "zod";
import { appointmentController } from "../../container/index";

type CreateAppointmentRouteRequest = {
  Body: CreateAppointmentSchemaDTO;
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
}
