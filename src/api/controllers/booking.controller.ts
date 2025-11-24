import { FastifyRequest, FastifyReply } from "fastify";
import { BookingService } from "../../services/booking.service";
import { createBookingSchema } from "../../schemas/booking.schema";

export class BookingController{
    constructor(private readonly bookingService: BookingService) {}

    async book(request: FastifyRequest, reply: FastifyReply) {
        const params = createBookingSchema.parse(request.body);
        const booking = await this.bookingService.book(params);
        return reply.status(201).send(booking);
    }
}