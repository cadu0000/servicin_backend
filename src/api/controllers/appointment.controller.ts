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
import { sendSuccess, sendError } from "../../utils/response";

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

type CompleteServiceRequest = FastifyRequest<{
  Params: { appointmentId: string };
}>;

type ConfirmPaymentRequest = FastifyRequest<{
  Params: { appointmentId: string };
}>;

type GetAppointmentDetailRequest = FastifyRequest<{
  Params: { appointmentId: string };
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

      return sendSuccess(
        res,
        {
          appointmentId: appointment.id,
          status: appointment.status,
        },
        "Solicitação de agendamento criada com sucesso. Aguardando aprovação do prestador.",
        201
      );
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`[API] Invalid Appointment Input: ${error.message}`);
        return sendError(res, error.message, 400);
      }

      console.error("[API] Internal Error during appointment creation:", error);
      return sendError(
        res,
        "Falha interna ao processar a solicitação de agendamento.",
        500
      );
    }
  }

  async updateStatus(req: UpdateAppointmentStatusRequest, res: FastifyReply) {
    const { appointmentId } = req.params;
    const { status, reason } = req.body;
    const { sub: userId } = req.user as UserPayload;

    try {
      const updatedAppointment =
        await this.appointmentService.updateAppointmentStatus(
          appointmentId,
          status,
          reason,
          userId
        );

      return sendSuccess(
        res,
        updatedAppointment,
        "Status do agendamento atualizado com sucesso"
      );
    } catch (error) {
      console.error("Erro ao atualizar status do agendamento:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("não encontrado") ||
          error.message.includes("não existe")
        ) {
          return sendError(res, error.message, 404);
        }

        if (
          error.message.includes("inválido") ||
          error.message.includes("status atual") ||
          error.message.includes("obrigatório")
        ) {
          return sendError(res, error.message, 400);
        }
      }

      return sendError(
        res,
        "Erro interno do servidor ao processar a atualização.",
        500
      );
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

      return sendSuccess(
        res,
        canceledAppointment,
        "Agendamento cancelado com sucesso"
      );
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("não encontrado") ||
          error.message.includes("não existe")
        ) {
          return sendError(res, error.message, 404);
        }

        if (error.message.includes("permissão")) {
          return sendError(res, error.message, 403);
        }

        if (error.message.includes("obrigatório")) {
          return sendError(res, error.message, 400);
        }
      }

      return sendError(
        res,
        "Erro interno do servidor ao processar o cancelamento.",
        500
      );
    }
  }

  async completeService(req: CompleteServiceRequest, res: FastifyReply) {
    const { appointmentId } = req.params;
    const { sub: userId } = req.user as UserPayload;

    try {
      const completedAppointment =
        await this.appointmentService.completeService(appointmentId, userId);

      return sendSuccess(
        res,
        completedAppointment,
        "Serviço concluído com sucesso"
      );
    } catch (error) {
      console.error("Erro ao completar serviço:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("não encontrado") ||
          error.message.includes("não existe")
        ) {
          return sendError(res, error.message, 404);
        }

        if (error.message.includes("permissão")) {
          return sendError(res, error.message, 403);
        }

        if (
          error.message.includes("já foi") ||
          error.message.includes("não é possível")
        ) {
          return sendError(res, error.message, 400);
        }
      }

      return sendError(
        res,
        "Erro interno do servidor ao processar a finalização do serviço.",
        500
      );
    }
  }

  async confirmPayment(req: ConfirmPaymentRequest, res: FastifyReply) {
    const { appointmentId } = req.params;
    const { sub: userId } = req.user as UserPayload;

    try {
      const confirmedPayment = await this.appointmentService.confirmPayment(
        appointmentId,
        userId
      );

      return sendSuccess(
        res,
        confirmedPayment,
        "Pagamento confirmado com sucesso"
      );
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("não encontrado") ||
          error.message.includes("não existe")
        ) {
          return sendError(res, error.message, 404);
        }

        if (
          error.message.includes("permissão") ||
          error.message.includes("Apenas")
        ) {
          return sendError(res, error.message, 403);
        }

        if (
          error.message.includes("já foi") ||
          error.message.includes("só pode ser confirmado")
        ) {
          return sendError(res, error.message, 400);
        }
      }

      return sendError(
        res,
        "Erro interno do servidor ao processar a confirmação do pagamento.",
        500
      );
    }
  }

  async findById(req: GetAppointmentDetailRequest, res: FastifyReply) {
    const { appointmentId } = req.params;
    const { sub: userId } = req.user as UserPayload;

    try {
      const appointment = await this.appointmentService.getAppointmentDetails(
        appointmentId,
        userId
      );

      return sendSuccess(res, appointment);
    } catch (error) {
      console.error("Erro ao buscar detalhes do agendamento:", error);

      if (error instanceof Error) {
        if (
          error.message.includes("não encontrado") ||
          error.message.includes("não existe")
        ) {
          return sendError(res, error.message, 404);
        }

        if (error.message.includes("permissão")) {
          return sendError(res, error.message, 403);
        }
      }

      return sendError(
        res,
        "Erro interno do servidor ao buscar detalhes do agendamento.",
        500
      );
    }
  }

  async getMyAppointments(req: FastifyRequest, res: FastifyReply) {
    const { sub: clientId } = req.user as UserPayload;

    try {
      const appointments = await this.appointmentService.getClientAppointments(
        clientId
      );

      return sendSuccess(res, appointments);
    } catch (error) {
      console.error("Erro ao buscar agendamentos do cliente:", error);

      return sendError(
        res,
        "Erro interno do servidor ao buscar agendamentos.",
        500
      );
    }
  }

  async getReceivedAppointments(req: FastifyRequest, res: FastifyReply) {
    const { sub: providerId } = req.user as UserPayload;

    try {
      const appointments =
        await this.appointmentService.getProviderAppointments(providerId);

      return sendSuccess(res, appointments);
    } catch (error) {
      console.error("Erro ao buscar agendamentos recebidos:", error);

      return sendError(
        res,
        "Erro interno do servidor ao buscar agendamentos.",
        500
      );
    }
  }
}
