import { z } from "zod";

export const signUpUserSchema = z.object({
  email: z
    .email("Invalid email address")
    .describe("The user must register an email")
    .default("johndoe@email.com"),
  password: z
    .string()
    .min(6)
    .describe("The user must register a password")
    .default("123456"),
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
  contact: z
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

export const signUpIndividualUserSchema = z.object({
  userId: z
    .uuid("Invalid user ID")
    .describe("The ID of the individual user")
    .default("550e8400-e29b-41d4-a716-446655440000"),
  fullName: z
    .string()
    .min(1, "Full name cannot be empty")
    .describe("The full name of the individual user")
    .default("John Doe"),
  cpf: z
    .string()
    .min(11, "CPF must be at least 11 characters")
    .describe("The CPF of the individual user")
    .default("123.456.789-00"),
  birthDate: z.coerce
    .date()
    .nullable()
    .describe("The birth date of the individual user")
    .default(new Date("1990-01-01")),
});

export type SignUpUserDTO = z.infer<typeof signUpUserSchema>;
export type SignUpIndividualUserDTO = z.infer<
  typeof signUpIndividualUserSchema
>;
