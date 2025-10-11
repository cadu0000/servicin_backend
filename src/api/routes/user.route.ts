import { FastifyInstance } from "fastify";
import { userController } from "../../container";
import { signUpUserSchema } from "../../schemas/user.schema";
import { z } from "zod";

export async function userRoutes(server: FastifyInstance) {
  server.post(
    "/signup",
    {
      schema: {
        summary: "Create a new user",
        description: "Endpoint to create a new user account",
        tags: ["Authentication"],
        body: signUpUserSchema,
        response: {
          201: z.object({
            token: z.string(),
            user: z.object({
              id: z.uuid(),
              email: z.email(),
              photoUrl: z.url().nullable(),
              address: z.array(
                z.object({
                  number: z.string().nullable(),
                  street: z.string(),
                  city: z.string(),
                  state: z.string(),
                  zipCode: z.string(),
                  neighborhood: z.string(),
                  country: z.string(),
                })
              ),
              contacts: z.array(
                z.object({
                  type: z.string(),
                  value: z.string(),
                })
              ),
            }),
          }),
        },
      },
    },
    (request, reply) => userController.signup(request, reply)
  );
}
