import { FastifyReply, FastifyRequest } from "fastify";
import { ReviewService } from "../../services/review.service";
import { createReviewSchema } from "../../schemas/review.schema";
import type { UserPayload } from "../../@types/fastify";

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

      return res.status(201).send({
        message: "Avaliação criada com sucesso.",
        review,
      });
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`[API] Invalid Review Input: ${error.message}`);

        if (
          error.message.includes("não encontrado") ||
          error.message.includes("não foi encontrado")
        ) {
          return res.status(404).send({
            message: error.message,
            code: "NOT_FOUND",
          });
        }

        if (
          error.message.includes("permissão") ||
          error.message.includes("não tem permissão")
        ) {
          return res.status(403).send({
            message: error.message,
            code: "FORBIDDEN",
          });
        }

        if (
          error.message.includes("já foi avaliado") ||
          error.message.includes("concluídos e pagos")
        ) {
          return res.status(400).send({
            message: error.message,
            code: "INVALID_INPUT",
          });
        }

        return res.status(400).send({
          message: error.message,
          code: "INVALID_INPUT",
        });
      }

      console.error("[API] Internal Error during review creation:", error);
      return res.status(500).send({
        message: "Falha interna ao processar a avaliação.",
        code: "INTERNAL_SERVER_ERROR",
      });
    }
  }
}
