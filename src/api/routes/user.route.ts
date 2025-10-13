import { FastifyInstance } from "fastify";
import { userController } from "../../container";
import {
  signupUserResponseSchema,
  signupUserSchema,
} from "../../schemas/user.schema";

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
}
