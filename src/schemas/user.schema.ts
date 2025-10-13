import { cnpj, cpf } from "cpf-cnpj-validator";
import { z } from "zod";

/**
 * Request schema for user signup.
 * This schema is used to validate the data received when a user attempts to sign up.
 */

const signupDefaultUserSchema = z.object({
  email: z
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
    .enum(["INDIVIDUAL", "COMPANY"], "Unknown user type")
    .describe("The user must select a user type")
    .default("INDIVIDUAL"),
  photoUrl: z
    .url()
    .nullable()
    .describe("The user can provide a photo URL")
    .default(null),
  address: z
    .array(
      z.object({
        street: z
          .string()
          .min(1, "Street cannot be empty")
          .describe("The user must provide a street")
          .default("Main St"),
        city: z
          .string()
          .min(1, "City cannot be empty")
          .describe("The user must provide a city")
          .default("Springfield"),
        state: z
          .string()
          .min(1, "State cannot be empty")
          .describe("The user must provide a state")
          .default("IL"),
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
        country: z
          .string()
          .min(1, "Country cannot be empty")
          .describe("The user must provide a country")
          .default("USA"),
      })
    )
    .min(1, "At least one address is required")
    .describe("The user must provide an address"),
  contacts: z
    .array(
      z.object({
        type: z
          .enum(["PHONE", "EMAIL"], "Unknown contact type")
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
  birthDate: z.coerce
    .date()
    .nullable()
    .describe("The birth date of the individual user")
    .default(new Date("1990-01-01")),
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

/**
 * Response schema for user signup.
 * This schema is used to validate the response structure after a user signs up.
 */

const defaultSignupUserResponseSchema = z.object({
  id: z.uuid().describe("The unique identifier of the user"),
  email: z.email().describe("The email of the user"),
  photoUrl: z.url().nullable().describe("The photo URL of the user"),
  userType: z.enum(["INDIVIDUAL", "COMPANY"]).describe("The type of the user"),
  address: z
    .array(
      z.object({
        number: z.string().nullable().describe("The address number"),
        street: z.string().describe("The street name"),
        city: z.string().describe("The city name"),
        state: z.string().describe("The state name"),
        zipCode: z.string().describe("The zip code"),
        neighborhood: z.string().describe("The neighborhood name"),
        country: z.string().describe("The country name"),
      })
    )
    .describe("List of user addresses"),
  contacts: z
    .array(
      z.object({
        type: z.string().describe("The contact type"),
        value: z.string().describe("The contact value"),
      })
    )
    .describe("List of user contacts"),
});

const signupIndividualUserResponseSchema =
  defaultSignupUserResponseSchema.extend({
    userType: z.literal("INDIVIDUAL"),
    fullName: z.string().describe("The full name of the individual user"),
    cpf: z.string().describe("The CPF of the individual user"),
    birthDate: z
      .string()
      .nullable()
      .describe("The birth date of the individual user"),
  });

const signupCompanyUserResponseSchema = defaultSignupUserResponseSchema.extend({
  userType: z.literal("COMPANY"),
  corporateName: z.string().describe("The corporate name of the company user"),
  cnpj: z.string().describe("The CNPJ of the company user"),
  tradeName: z
    .string()
    .nullable()
    .describe("The trade name of the company user"),
});

export const signupUserResponseSchema = z.object({
  token: z.string().describe("JWT token for authentication"),
  user: z.discriminatedUnion("userType", [
    signupIndividualUserResponseSchema,
    signupCompanyUserResponseSchema,
  ]),
});

export type SignupUserDTO = z.infer<typeof signupUserSchema>;
export type SignupIndividualUserDTO = z.infer<
  typeof signupIndividualUserSchema
>;
export type SignupCompanyUserDTO = z.infer<typeof signupCompanyUserSchema>;
