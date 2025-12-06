import { FastifyReply, FastifyRequest } from "fastify";
import { AppointmentService } from "../../services/appointment.service";
import {
  createAppointmentSchema,
  CreateAppointmentSchemaDTO,
  UpdateAppointmentStatusDTO,
  CancelAppointmentDTO,
  cancelAppointmentSchema,
} from "../../schemas/appointment.shema";
import type { UserPayload } from "../../@types/fastify";

type CreateAppointmentRequest = FastifyRequest<{
  Body: CreateAppointmentSchemaDTO;
}>;

type UpdateAppointmentStatusRequest = FastifyRequest<{
  Params: { appointmentId: UpdateAppointmentStatusDTO["appointmentId"] };
  Body: {
    status: UpdateAppointmentStatusDTO["status"];
    reason?: UpdateAppointmentStatusDTO["reason"];
  };
}>;

type CancelAppointmentRequest = FastifyRequest<{
  Params: { appointmentId: string };
  Body: CancelAppointmentDTO;
}>;
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  async create(req: CreateAppointmentRequest, res: FastifyReply) {
    const body = req.body;
    const { sub: clientId } = req.user as UserPayload;

    try {
      const appointmentDTO = createAppointmentSchema.parse(body);
      const appointment = await this.appointmentService.createAppointment({
        ...appointmentDTO,
        clientId,
      });

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

  async updateStatus(req: UpdateAppointmentStatusRequest, res: FastifyReply) {
    const { appointmentId } = req.params;
    const { status, reason } = req.body;

    try {
      const updatedAppointment =
        await this.appointmentService.updateAppointmentStatus(
          appointmentId,
          status,
          reason
        );

      return res.status(200).send(updatedAppointment);
    } catch (error) {
      console.error("Erro ao atualizar status do agendamento:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("não encontrado") ||
          error.message.includes("does not exist")
        ) {
          return res.status(404).send({
            statusCode: 404,
            message: error.message,
          });
        }

        if (
          error.message.includes("inválido") ||
          error.message.includes("status atual") ||
          error.message.includes("obrigatório")
        ) {
          return res.status(400).send({
            statusCode: 400,
            message: error.message,
          });
        }
      }

      return res.status(500).send({
        statusCode: 500,
        message: "Erro interno do servidor ao processar a atualização.",
      });
    }
  }

  async cancel(req: CancelAppointmentRequest, res: FastifyReply) {
    const { appointmentId } = req.params;
    const { reason } = req.body;
    const { sub: userId } = req.user as UserPayload;

    try {
      const cancelDTO = cancelAppointmentSchema.parse({ reason });
      const canceledAppointment =
        await this.appointmentService.cancelAppointment(
          appointmentId,
          userId,
          cancelDTO.reason
        );

      return res.status(200).send(canceledAppointment);
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("não encontrado") ||
          error.message.includes("does not exist")
        ) {
          return res.status(404).send({
            statusCode: 404,
            message: error.message,
          });
        }

        if (error.message.includes("permissão")) {
          return res.status(403).send({
            statusCode: 403,
            message: error.message,
          });
        }

        if (error.message.includes("obrigatório")) {
          return res.status(400).send({
            statusCode: 400,
            message: error.message,
          });
        }
      }

      return res.status(500).send({
        statusCode: 500,
        message: "Erro interno do servidor ao processar o cancelamento.",
      });
    }
  }
}
