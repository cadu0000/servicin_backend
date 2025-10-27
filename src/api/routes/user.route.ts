import { FastifyInstance } from "fastify";
import { userController } from "../../container";
import {
  signupUserSchema,
  LoginUserDTO,
  createServiceProviderSchema,
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
          201: z.object({
            token: z.string().describe("JWT token for authentication"),
          }),
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

  server.post(
    "/provider",
    {
      schema: {
        summary: "Create a service provider",
        description: "Endpoint to promote a user to a service provider",
        tags: ["Authentication"],
        body: createServiceProviderSchema,
        response: {
          201: z
            .object({
              userId: z
                .string()
                .uuid()
                .describe("ID of the user promoted to service provider"),
            })
            .describe("Service provider created successfully"),
        },
      },
    },
    (request, reply) => userController.createServiceProvider(request, reply)
  );
}
