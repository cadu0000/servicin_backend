import { FastifyInstance } from "fastify";
import { z } from "zod";
import { signupUserSchema, LoginUserDTO } from "../../schemas/auth.schema";
import { authController } from "../../container";

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
          201: z.object({
            token: z.string().describe("JWT token for authentication"),
          }),
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
          200: z.object({
            token: z.string().describe("JWT token for authentication"),
          }),
        },
      },
    },
    (request, reply) => authController.login(request, reply)
  );

  server.post(
    "/logout",
    {
      schema: {
        summary: "Logout a user",
        description:
          "Endpoint to logout a user and clear the authentication cookie",
        tags: ["Authentication"],
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    (request, reply) => authController.logout(request, reply)
  );
}
