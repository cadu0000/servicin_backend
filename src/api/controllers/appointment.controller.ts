import { FastifyReply, FastifyRequest } from "fastify";
import { AppointmentService } from "../../services/appointment.service";
import {
  createAppointmentSchema,
  CreateAppointmentSchemaDTO,
} from "../../schemas/appointment.shema";

type CreateAppointmentRequest = FastifyRequest<{
  Body: CreateAppointmentSchemaDTO;
}>;

export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async create(req: CreateAppointmentRequest, res: FastifyReply) {
    const body = req.body;

    try {
      const appointmentDTO = createAppointmentSchema.parse(body);
      const appointment = await this.appointmentService.createAppointment(
        appointmentDTO
      );

      return res.status(201).send({
        message:
          "Solicitação de agendamento criada com sucesso. Aguardando aprovação do prestador.",
        appointmentId: appointment.id,
        status: appointment.status,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`[API] Invalid Appointment Input: ${error.message}`);
        return res.status(400).send({
          message: error.message,
          code: "INVALID_INPUT",
        });
      }

      console.error("[API] Internal Error during appointment creation:", error);
      return res.status(500).send({
        message: "Falha interna ao processar a solicitação de agendamento.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
}
