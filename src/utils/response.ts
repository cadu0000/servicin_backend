import { FastifyReply } from "fastify";
import { z } from "zod";

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
};

export function createApiResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    success: z.boolean(),
    message: z.string().optional(),
  });
}

export function createErrorResponseSchema() {
  return z.object({
    data: z.null(),
    success: z.literal(false),
    message: z.string(),
  });
}

export function sendSuccess<T>(
  reply: FastifyReply,
  data: T,
  message?: string,
  statusCode: number = 200
): FastifyReply {
  const response: ApiResponse<T> = {
    data,
    success: true,
  };

  if (message) {
    response.message = message;
  }

  return reply.status(statusCode).send(response);
}

export function sendError(
  reply: FastifyReply,
  message: string,
  statusCode: number = 500
): FastifyReply {
  const response: ApiResponse<null> = {
    data: null,
    success: false,
    message,
  };

  return reply.status(statusCode).send(response);
}
