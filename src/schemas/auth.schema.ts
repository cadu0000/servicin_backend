import { cnpj, cpf } from "cpf-cnpj-validator";
import { z } from "zod";

const signupDefaultUserSchema = z.object({
  email: z
    .string()
    .email("Endereço de email inválido")
    .describe("The user must register an email")
    .default("johndoe@email.com"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .max(30, "A senha deve ter no máximo 30 caracteres")
    .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .describe("The user must register a password")
    .default("JohnDoe123"),
  userType: z
    .enum(["INDIVIDUAL", "COMPANY"])
    .describe("The user must select a user type")
    .default("INDIVIDUAL"),
  photoUrl: z
    .string()
    .url()
    .nullable()
    .describe("The user can provide a photo URL")
    .default(null),
  address: z
    .object({
      street: z
        .string()
        .min(1, "A rua não pode estar vazia")
        .describe("The user must provide a street")
        .default("Main St"),
      cityId: z
        .string()
        .uuid("O ID da cidade deve ser um UUID válido")
        .describe("The user must provide a city ID")
        .default("550e8400-e29b-41d4-a716-446655440000"),
      stateId: z
        .string()
        .uuid("O ID do estado deve ser um UUID válido")
        .describe("The user must provide a state ID")
        .default("550e8400-e29b-41d4-a716-446655440001"),
      zipCode: z
        .string()
        .min(1, "O CEP não pode estar vazio")
        .describe("The user must provide a zip code")
        .default("62701"),
      neighborhood: z
        .string()
        .min(1, "O bairro não pode estar vazio")
        .describe("The user must provide a neighborhood")
        .default("Downtown"),
      number: z
        .string()
        .nullable()
        .describe("The user must provide a number")
        .default("123"),
    })
    .describe("The user must provide an address"),
  contacts: z
    .array(
      z.object({
        type: z
          .enum(["PHONE", "EMAIL"])
          .describe("The contact type")
          .default("PHONE"),
        value: z
          .string()
          .min(1, "O valor do contato não pode estar vazio")
          .describe("The contact value")
          .default("555-1234"),
      })
    )
    .min(1, "Pelo menos um contato é necessário")
    .describe("The user must provide contacts"),
});

const signupIndividualUserSchema = z.object({
  ...signupDefaultUserSchema.shape,
  userType: z.literal("INDIVIDUAL"),
  fullName: z
    .string()
    .min(1, "O nome completo não pode estar vazio")
    .describe("The full name of the individual user")
    .default("John Doe"),
  cpf: z
    .string()
    .min(11, "CPF deve ter pelo menos 11 caracteres")
    .max(11, "CPF deve ter no máximo 11 caracteres")
    .refine((val) => cpf.isValid(val), { message: "CPF inválido" })
    .describe("The CPF of the individual user")
    .default("37133126052"),
  birthDate: z
    .string()
    .datetime()
    .nullable()
    .describe("The birth date of the individual user")
    .default("1990-01-01T00:00:00.000Z"),
});

const signupCompanyUserSchema = z.object({
  ...signupDefaultUserSchema.shape,
  userType: z.literal("COMPANY"),
  corporateName: z
    .string()
    .min(1, "A razão social não pode estar vazia")
    .describe("The corporate name of the company user")
    .default("Acme Corp"),
  cnpj: z
    .string()
    .min(14, "CNPJ deve ter pelo menos 14 caracteres")
    .max(14, "CNPJ deve ter no máximo 14 caracteres")
    .refine((val) => cnpj.isValid(val), { message: "CNPJ inválido" })
    .describe("The CNPJ of the company user")
    .default("15357397000140"),
  tradeName: z
    .string()
    .nullable()
    .describe("The trade name of the company user")
    .default("Acme"),
});

export const signupUserSchema = z.discriminatedUnion("userType", [
  signupIndividualUserSchema,
  signupCompanyUserSchema,
]);

export const loginUserSchema = z.object({
  email: z.string().email().default("johndoe@email.com"),
  password: z.string().min(1, "A senha é obrigatória").default("JohnDoe123"),
});

export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export const LoginUserDTO = loginUserSchema;

export type SignupUserDTO = z.infer<typeof signupUserSchema>;
export type SignupIndividualUserDTO = z.infer<
  typeof signupIndividualUserSchema
>;
export type SignupCompanyUserDTO = z.infer<typeof signupCompanyUserSchema>;
