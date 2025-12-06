import { cnpj, cpf } from "cpf-cnpj-validator";
import { z } from "zod";

const signupDefaultUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .describe("The user must register an email")
    .default("johndoe@email.com"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must be at most 30 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
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
        .min(1, "Street cannot be empty")
        .describe("The user must provide a street")
        .default("Main St"),
      cityId: z
        .string()
        .uuid("City ID must be a valid UUID")
        .describe("The user must provide a city ID")
        .default("550e8400-e29b-41d4-a716-446655440000"),
      stateId: z
        .string()
        .uuid("State ID must be a valid UUID")
        .describe("The user must provide a state ID")
        .default("550e8400-e29b-41d4-a716-446655440001"),
      zipCode: z
        .string()
        .min(1, "Zip code cannot be empty")
        .describe("The user must provide a zip code")
        .default("62701"),
      neighborhood: z
        .string()
        .min(1, "Neighborhood cannot be empty")
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
          .min(1, "Contact value cannot be empty")
          .describe("The contact value")
          .default("555-1234"),
      })
    )
    .min(1, "At least one contact is required")
    .describe("The user must provide contacts"),
});

const signupIndividualUserSchema = z.object({
  ...signupDefaultUserSchema.shape,
  userType: z.literal("INDIVIDUAL"),
  fullName: z
    .string()
    .min(1, "Full name cannot be empty")
    .describe("The full name of the individual user")
    .default("John Doe"),
  cpf: z
    .string()
    .min(11, "CPF must be at least 11 characters")
    .max(11, "CPF must be at most 11 characters")
    .refine((val) => cpf.isValid(val), { message: "Invalid CPF" })
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
    .min(1, "Corporate name cannot be empty")
    .describe("The corporate name of the company user")
    .default("Acme Corp"),
  cnpj: z
    .string()
    .min(14, "CNPJ must be at least 14 characters")
    .max(14, "CNPJ must be at most 14 characters")
    .refine((val) => cnpj.isValid(val), { message: "Invalid CNPJ" })
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
  password: z.string().min(1, "Password is required").default("JohnDoe123"),
});

export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export const LoginUserDTO = loginUserSchema;

export type SignupUserDTO = z.infer<typeof signupUserSchema>;
export type SignupIndividualUserDTO = z.infer<
  typeof signupIndividualUserSchema
>;
export type SignupCompanyUserDTO = z.infer<typeof signupCompanyUserSchema>;
