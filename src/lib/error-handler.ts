import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { sendError } from "../utils/response";

type ValidationError = {
  validation?: string;
  code?: string;
  message: string;
  path?: (string | number)[];
};

export function formatZodError(error: ZodError): string {
  const errors = error.errors.map((err) => {
    const path = err.path.join(".");
    return `${path ? `${path}: ` : ""}${err.message}`;
  });

  if (errors.length === 1) {
    return errors[0];
  }

  return errors.join("; ");
}

export function formatValidationErrors(
  validationErrors: ValidationError[]
): string {
  const errors = validationErrors.map((err) => {
    const path = (err.path || []).join(".");
    return `${path ? `${path}: ` : ""}${err.message}`;
  });

  if (errors.length === 1) {
    return errors[0];
  }

  return errors.join("; ");
}

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (error.code === "FST_ERR_VALIDATION") {
    let validationErrors: ValidationError[] = [];

    if (error.validation) {
      if (Array.isArray(error.validation)) {
        validationErrors = error.validation.map((err: any) => ({
          message: err.message || "Invalid input",
          path: err.path || [],
          code: err.code,
          validation: err.validation,
        }));
      } else if (
        error.validation &&
        typeof error.validation === "object" &&
        "errors" in error.validation
      ) {
        const zodError = error.validation as unknown as ZodError;
        const message = formatZodError(zodError);
        return sendError(reply, message, 400);
      }
    }

    if (error.message) {
      try {
        const parsed = JSON.parse(error.message);
        if (Array.isArray(parsed)) {
          validationErrors = parsed.map((err: any) => ({
            message: err.message || "Invalid input",
            path: err.path || [],
            code: err.code,
            validation: err.validation,
          }));
        }
      } catch {
        if (validationErrors.length === 0) {
          validationErrors = [{ message: error.message, path: [] }];
        }
      }
    }

    if (validationErrors.length > 0) {
      const message = formatValidationErrors(validationErrors);
      return sendError(reply, message, 400);
    }
  }

  if (error.statusCode) {
    return sendError(reply, error.message, error.statusCode);
  }

  console.error("[API] Unhandled Error:", error);
  return sendError(reply, "Erro interno do servidor", 500);
}
