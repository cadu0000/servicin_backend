import { FastifyInstance } from "fastify";
import { createBookingSchema } from "../../schemas/booking.schema";
import z from "zod";
import { bookingController } from "../../container";

export async function bookingRoutes(server: FastifyInstance) {
  server.post(
    "/",
    {
      schema: {
        summary: "Create a new booking",
        description: "Endpoint to create a new booking for a service",
        tags: ["Bookings"],
        body: createBookingSchema,
        response: {
          201: createBookingSchema.extend({
            id: createBookingSchema.shape.serviceId,
            createdAt: z.string().datetime().describe("Timestamp of booking creation"),
            updatedAt: z.string().datetime().describe("Timestamp of last update"),
          }),
        },
      },
    },
    async (request, reply) => bookingController.book(request, reply)
  );
}
