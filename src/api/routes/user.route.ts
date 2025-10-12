import { FastifyInstance } from "fastify";
import { userController } from "../../container";
import {
  signUpCompanyUserSchema,
  signUpIndividualUserSchema,
  signUpUserSchema,
} from "../../schemas/user.schema";
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
            userId: z.uuid(),
          }),
        },
      },
    },
    (request, reply) => userController.signup(request, reply)
  );

  server.post(
    "/signup/individual",
    {
      schema: {
        summary: "Create a new individual user",
        description: "Endpoint to create a new individual user account",
        tags: ["Authentication"],
        body: signUpIndividualUserSchema,
        response: {
          201: z.object({
            token: z.string(),
            user: z.object({
              id: z.uuid(),
              cpf: z.string(),
              fullName: z.string(),
              birthDate: z.string().nullable(),
              email: z.email(),
              photoUrl: z.url().nullable(),
              userType: z.enum(["INDIVIDUAL", "COMPANY"]),
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
    (request, reply) => userController.signupIndividual(request, reply)
  );

  server.post(
    "/signup/company",
    {
      schema: {
        summary: "Create a new company user",
        description: "Endpoint to create a new company user account",
        tags: ["Authentication"],
        body: signUpCompanyUserSchema,
        response: {
          201: z.object({
            token: z.string(),
            user: z.object({
              id: z.uuid(),
              cnpj: z.string(),
              corporateName: z.string(),
              tradeName: z.string(),
              email: z.email(),
              photoUrl: z.url().nullable(),
              userType: z.enum(["INDIVIDUAL", "COMPANY"]),
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
    (request, reply) => userController.signupCompany(request, reply)
  );
}
