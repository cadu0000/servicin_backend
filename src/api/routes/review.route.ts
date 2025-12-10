import { FastifyInstance } from "fastify";
import { createReviewSchema } from "../../schemas/review.schema";
import { z } from "zod";
import { reviewController } from "../../container/index";
import { createApiResponseSchema, createErrorResponseSchema } from "../../utils/response";

type CreateReviewRouteRequest = {
  Body: {
    appointmentId: string;
    rating: number;
    comment?: string;
  };
};

export async function reviewRoutes(server: FastifyInstance) {
  server.post<CreateReviewRouteRequest>(
    "/",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Create review",
        description:
          "Create a review for a completed and paid appointment. Requires authentication.",
        tags: ["Review"],
        body: createReviewSchema,
        response: {
          201: createApiResponseSchema(
            z.object({
              id: z.string().uuid(),
              serviceId: z.string().uuid(),
              clientId: z.string().uuid(),
              appointmentId: z.string().uuid(),
              rating: z.coerce.number(),
              comment: z.string().nullable(),
              createdAt: z.coerce.date(),
            })
          ),
          400: createErrorResponseSchema(),
          403: createErrorResponseSchema(),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => reviewController.create(request, reply)
  );
}
