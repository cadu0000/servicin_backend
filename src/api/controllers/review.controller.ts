import { FastifyReply, FastifyRequest } from "fastify";
import { ReviewService } from "../../services/review.service";
import { createReviewSchema } from "../../schemas/review.schema";
import type { UserPayload } from "../../@types/fastify";
import { sendSuccess, sendError } from "../../utils/response";

type CreateReviewRequest = FastifyRequest<{
  Body: {
    appointmentId: string;
    rating: number;
    comment?: string;
  };
}>;

export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  async create(req: CreateReviewRequest, res: FastifyReply) {
    const body = req.body;
    const { sub: clientId } = req.user as UserPayload;

    try {
      const reviewDTO = createReviewSchema.parse(body);
      const review = await this.reviewService.create(reviewDTO, clientId);

      return sendSuccess(res, review, "Avaliação criada com sucesso", 201);
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`[API] Invalid Review Input: ${error.message}`);

        if (
          error.message.includes("não encontrado") ||
          error.message.includes("não foi encontrado")
        ) {
          return sendError(res, error.message, 404);
        }

        if (
          error.message.includes("permissão") ||
          error.message.includes("não tem permissão")
        ) {
          return sendError(res, error.message, 403);
        }

        if (
          error.message.includes("já foi avaliado") ||
          error.message.includes("concluídos e pagos")
        ) {
          return sendError(res, error.message, 400);
        }

        return sendError(res, error.message, 400);
      }

      console.error("[API] Internal Error during review creation:", error);
      return sendError(res, "Falha interna ao processar a avaliação.", 500);
    }
  }
}
