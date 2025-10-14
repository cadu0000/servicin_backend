import { FastifyInstance } from "fastify";
import { userController } from "../../container";
import {
  signupUserResponseSchema,
  signupUserSchema,
  LoginUserDTO,
} from "../../schemas/user.schema";
import z from "zod";

export async function userRoutes(server: FastifyInstance) {
  server.post(
    "/signup",
    {
      schema: {
        summary: "Create a new user",
        description: "Endpoint to create a new user account",
        tags: ["Authentication"],
        body: signupUserSchema,
        response: {
          201: signupUserResponseSchema,
        },
      },
    },
    (request, reply) => userController.signup(request, reply)
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
    (request, reply) => userController.login(request, reply)
  );
}
