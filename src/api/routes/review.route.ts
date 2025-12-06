import { FastifyInstance } from "fastify";
import { createReviewSchema } from "../../schemas/review.schema";
import { z } from "zod";
import { reviewController } from "../../container/index";

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
          201: z.object({
            message: z.string(),
            review: z.object({
              id: z.string().uuid(),
              serviceId: z.string().uuid(),
              clientId: z.string().uuid(),
              rating: z.number(),
              comment: z.string().nullable(),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => reviewController.create(request, reply)
  );
}
