import { z } from "zod";

export const stateSchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the state"),
  name: z.string().describe("Name of the state"),
});

export const citySchema = z.object({
  id: z.string().uuid().describe("Unique identifier for the city"),
  name: z.string().describe("Name of the city"),
});

export const getCitiesByStateParamsSchema = z.object({
  stateId: z.string().uuid().describe("Unique identifier for the state (UUID)"),
});
