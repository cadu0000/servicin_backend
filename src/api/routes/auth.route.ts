import { FastifyInstance } from "fastify";
import { z } from "zod";
import { signupUserSchema, LoginUserDTO } from "../../schemas/auth.schema";
import { authController } from "../../container";
import {
  createApiResponseSchema,
  createErrorResponseSchema,
} from "../../utils/response";

export async function authRoutes(server: FastifyInstance) {
  server.post(
    "/signup",
    {
      schema: {
        summary: "Create a new user",
        description: "Endpoint to create a new user account",
        tags: ["Authentication"],
        body: signupUserSchema,
        response: {
          201: createApiResponseSchema(
            z.object({
              token: z.string().describe("JWT token for authentication"),
            })
          ),
          400: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    (request, reply) => authController.signup(request, reply)
  );

  server.post(
    "/login",
    {
      schema: {
        summary: "Login a user",
        description: "Endpoint to authenticate a user and return a JWT token",
        tags: ["Authentication"],
        body: LoginUserDTO,
        response: {
          200: createApiResponseSchema(
            z.object({
              token: z.string().describe("JWT token for authentication"),
            })
          ),
          401: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    (request, reply) => authController.login(request, reply)
  );

  server.post(
    "/logout",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Logout a user",
        description:
          "Endpoint to logout a user and clear the authentication cookie",
        tags: ["Authentication"],
        response: {
          200: createApiResponseSchema(z.null()),
        },
      },
    },
    (request, reply) => authController.logout(request, reply)
  );

  server.get(
    "/me",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Get current user information",
        description: "Endpoint to get the authenticated user's information",
        tags: ["Authentication"],
        response: {
          200: createApiResponseSchema(
            z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              userType: z.enum(["INDIVIDUAL", "COMPANY"]),
              photoUrl: z.string().nullable(),
              createdAt: z.date(),
              address: z.object({
                id: z.string().uuid(),
                country: z.object({
                  name: z.string(),
                }),
                state: z.object({
                  name: z.string(),
                }),
                city: z.object({
                  name: z.string(),
                }),
                neighborhood: z.string(),
                street: z.string(),
                zipCode: z.string(),
                number: z.string().nullable(),
              }),
              contacts: z.array(
                z.object({
                  id: z.string().uuid(),
                  type: z.enum(["EMAIL", "PHONE"]),
                  value: z.string(),
                })
              ),
              individual: z
                .object({
                  fullName: z.string(),
                  cpf: z.string(),
                  birthDate: z.date().nullable(),
                })
                .nullable(),
              company: z
                .object({
                  corporateName: z.string(),
                  cnpj: z.string(),
                  tradeName: z.string().nullable(),
                })
                .nullable(),
              role: z
                .enum(["PROVIDER", "CUSTOMER"])
                .describe("The role of the user"),
            })
          ),
          404: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    (request, reply) => authController.getMe(request, reply)
  );

  server.delete(
    "/me",
    {
      preHandler: [server.authenticate],
      schema: {
        summary: "Delete current user account",
        description:
          "Endpoint to delete the authenticated user's account. This performs a soft delete and cancels future appointments if the user is a service provider.",
        tags: ["Authentication"],
        response: {
          200: createApiResponseSchema(z.null()),
          400: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    (request, reply) => authController.deleteMe(request, reply)
  );
}
