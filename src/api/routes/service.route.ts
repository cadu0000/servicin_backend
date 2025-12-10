import { FastifyInstance } from "fastify";
import { serviceController } from "../../container";
import { z } from "zod";
import {
  createServiceSchema,
  fetchServicesQueryParamsSchema,
} from "../../schemas/service.schema";
import { createApiResponseSchema, createErrorResponseSchema } from "../../utils/response";

export async function serviceRoutes(server: FastifyInstance) {
  server.get(
    "/",
    {
      schema: {
        summary: "Fetch all services",
        description:
          "Endpoint to fetch all available services with optional filters",
        tags: ["Service"],
        querystring: fetchServicesQueryParamsSchema,
        response: {
          200: createApiResponseSchema(
            z.object({
              total: z.number().describe("Total number of services"),
              totalPages: z.number().describe("Total number of pages"),
              page: z.number().describe("Current page number"),
              pageSize: z.number().describe("Number of services per page"),
              data: z
                .array(
                z.object({
                  id: z
                    .string()
                    .uuid()
                    .describe("Unique identifier for the service"),
                  name: z.string().describe("Name of the service"),
                  description: z
                    .string()
                    .nullable()
                    .describe("Description of the service"),
                  price: z.coerce
                    .string()
                    .describe("Price of the service in BRL"),
                  rating: z.coerce
                    .string()
                    .describe("Average rating of the service (0.00 to 5.00)"),
                  photos: z
                    .array(
                      z.object({
                        id: z
                          .string()
                          .uuid()
                          .describe("Unique identifier for the photo"),
                        photoUrl: z.string().describe("URL of the photo"),
                      })
                    )
                    .describe("List of photos associated with the service"),
                  availabilities: z
                    .array(
                      z.object({
                        id: z
                          .string()
                          .uuid()
                          .describe("Unique identifier for the availability"),
                        dayOfWeek: z
                          .number()
                          .min(0)
                          .max(6)
                          .describe(
                            "Day of the week (0 - Sunday, 6 - Saturday)"
                          ),
                        startTime: z
                          .string()
                          .describe("Start time in HH:MM format"),
                        endTime: z
                          .string()
                          .describe("End time in HH:MM format"),
                        breakStart: z
                          .string()
                          .nullable()
                          .describe("Break start time in HH:MM format"),
                        breakEnd: z
                          .string()
                          .nullable()
                          .describe("Break end time in HH:MM format"),
                        slotDuration: z
                          .number()
                          .describe("Duration of each service slot in minutes"),
                        serviceId: z
                          .string()
                          .uuid()
                          .nullable()
                          .describe("ID of the service"),
                      })
                    )
                    .describe("List of availability schedules"),
                  provider: z
                    .object({
                      userId: z
                        .string()
                        .uuid()
                        .describe("Unique identifier for the service provider"),
                      averageRating: z.coerce
                        .string()
                        .describe("Average rating of the service provider"),
                      autoAcceptAppointments: z
                        .boolean()
                        .describe(
                          "Whether the provider automatically accepts appointments"
                        ),
                      showContactInfo: z
                        .boolean()
                        .describe(
                          "Whether the provider shows contact information"
                        ),
                      user: z
                        .object({
                          photoUrl: z
                            .string()
                            .nullable()
                            .describe("URL of the user's profile photo"),
                          individual: z
                            .object({
                              fullName: z
                                .string()
                                .describe("Full name of the individual user"),
                            })
                            .nullable()
                            .describe("Individual user details"),
                          contacts: z
                            .array(
                              z.object({
                                type: z
                                  .enum(["EMAIL", "PHONE"])
                                  .describe("Type of contact (EMAIL or PHONE)"),
                                value: z.string().describe("Contact value"),
                              })
                            )
                            .describe("List of user contacts"),
                        })
                        .describe("User details"),
                    })
                    .describe("Service provider details"),
                  category: z
                    .object({
                      id: z
                        .number()
                        .describe("Unique identifier for the category"),
                      name: z.string().describe("Name of the category"),
                      description: z
                        .string()
                        .nullable()
                        .describe("Description of the category"),
                    })
                    .describe("Category details"),
                  unavailableTimeSlots: z
                    .array(
                      z.object({
                        start: z
                          .string()
                          .describe("Start time in HH:MM format"),
                        end: z.string().describe("End time in HH:MM format"),
                        date: z.string().describe("Date in YYYY-MM-DD format"),
                      })
                    )
                    .describe(
                      "List of unavailable time slots due to appointments"
                    ),
                  address: z
                    .object({
                      state: z
                        .object({
                          id: z
                            .string()
                            .uuid()
                            .describe("Unique identifier for the state"),
                          name: z.string().describe("Name of the state"),
                        })
                        .describe("State details"),
                      city: z
                        .object({
                          id: z
                            .string()
                            .uuid()
                            .describe("Unique identifier for the city"),
                          name: z.string().describe("Name of the city"),
                        })
                        .describe("City details"),
                    })
                    .describe("Address details"),
                  reviews: z
                    .array(
                      z.object({
                        id: z
                          .string()
                          .uuid()
                          .describe("Unique identifier for the review"),
                        rating: z.coerce
                          .string()
                          .describe("Rating given to the service (1.0 to 5.0)"),
                        comment: z
                          .string()
                          .nullable()
                          .describe("Comment about the service"),
                        createdAt: z
                          .string()
                          .datetime()
                          .describe(
                            "Date and time when the review was created"
                          ),
                        client: z
                          .object({
                            id: z
                              .string()
                              .uuid()
                              .describe("Unique identifier for the client"),
                            individual: z
                              .object({
                                fullName: z
                                  .string()
                                  .describe(
                                    "Full name of the individual client"
                                  ),
                              })
                              .nullable()
                              .describe("Individual client details"),
                            company: z
                              .object({
                                corporateName: z
                                  .string()
                                  .describe(
                                    "Corporate name of the company client"
                                  ),
                              })
                              .nullable()
                              .describe("Company client details"),
                            photoUrl: z
                              .string()
                              .nullable()
                              .describe("URL of the client's profile photo"),
                          })
                          .describe("Client who wrote the review"),
                      })
                    )
                    .describe("List of reviews for the service"),
                })
              )
              .describe("Array of service objects"),
            })
          ),
          400: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => serviceController.fetch(request, reply)
  );

  server.get(
    "/:id",
    {
      schema: {
        summary: "Fetch service by ID",
        description: "Endpoint to fetch a specific service by its unique ID",
        tags: ["Service"],
        params: z.object({
          id: z.string().uuid().describe("Unique identifier for the service"),
        }),
        response: {
          200: createApiResponseSchema(
            z.object({
              id: z.string().uuid().describe("Unique identifier for the service"),
            name: z.string().describe("Name of the service"),
            description: z
              .string()
              .nullable()
              .describe("Description of the service"),
            price: z.coerce.string().describe("Price of the service in BRL"),
            rating: z.coerce
              .string()
              .describe("Average rating of the service (0.00 to 5.00)"),
            photos: z
              .array(
                z.object({
                  id: z
                    .string()
                    .uuid()
                    .describe("Unique identifier for the photo"),
                  photoUrl: z.string().describe("URL of the photo"),
                })
              )
              .describe("List of photos associated with the service"),
            availabilities: z
              .array(
                z.object({
                  id: z
                    .string()
                    .uuid()
                    .describe("Unique identifier for the availability"),
                  dayOfWeek: z
                    .number()
                    .min(0)
                    .max(6)
                    .describe("Day of the week (0 - Sunday, 6 - Saturday)"),
                  startTime: z.string().describe("Start time in HH:MM format"),
                  endTime: z.string().describe("End time in HH:MM format"),
                  breakStart: z
                    .string()
                    .nullable()
                    .describe("Break start time in HH:MM format"),
                  breakEnd: z
                    .string()
                    .nullable()
                    .describe("Break end time in HH:MM format"),
                  slotDuration: z
                    .number()
                    .describe("Duration of each service slot in minutes"),
                  serviceId: z
                    .string()
                    .uuid()
                    .nullable()
                    .describe("ID of the service"),
                })
              )
              .describe("List of availability schedules"),
            provider: z
              .object({
                userId: z
                  .string()
                  .uuid()
                  .describe("Unique identifier for the service provider"),
                averageRating: z.coerce
                  .string()
                  .describe("Average rating of the service provider"),
                autoAcceptAppointments: z
                  .boolean()
                  .describe(
                    "Whether the provider automatically accepts appointments"
                  ),
                showContactInfo: z
                  .boolean()
                  .describe("Whether the provider shows contact information"),
                user: z
                  .object({
                    photoUrl: z
                      .string()
                      .nullable()
                      .describe("URL of the user's profile photo"),
                    individual: z
                      .object({
                        fullName: z
                          .string()
                          .describe("Full name of the individual user"),
                      })
                      .nullable()
                      .describe("Individual user details"),
                    contacts: z
                      .array(
                        z.object({
                          type: z
                            .enum(["EMAIL", "PHONE"])
                            .describe("Type of contact (EMAIL or PHONE)"),
                          value: z.string().describe("Contact value"),
                        })
                      )
                      .describe("List of user contacts"),
                  })
                  .describe("User details"),
              })
              .describe("Service provider details"),
            category: z
              .object({
                id: z.number().describe("Unique identifier for the category"),
                name: z.string().describe("Name of the category"),
                description: z
                  .string()
                  .nullable()
                  .describe("Description of the category"),
              })
              .describe("Category details"),
            unavailableTimeSlots: z
              .array(
                z.object({
                  start: z.string().describe("Start time in HH:MM format"),
                  end: z.string().describe("End time in HH:MM format"),
                  date: z.string().describe("Date in YYYY-MM-DD format"),
                  appointmentId: z
                    .string()
                    .uuid()
                    .optional()
                    .describe("ID of the appointment"),
                  status: z
                    .enum([
                      "PENDING",
                      "APPROVED",
                      "REJECTED",
                      "CANCELED",
                      "COMPLETED",
                    ])
                    .optional()
                    .describe("Status of the appointment"),
                })
              )
              .describe("List of unavailable time slots due to appointments"),
            address: z
              .object({
                state: z
                  .object({
                    id: z
                      .string()
                      .uuid()
                      .describe("Unique identifier for the state"),
                    name: z.string().describe("Name of the state"),
                  })
                  .describe("State details"),
                city: z
                  .object({
                    id: z
                      .string()
                      .uuid()
                      .describe("Unique identifier for the city"),
                    name: z.string().describe("Name of the city"),
                  })
                  .describe("City details"),
              })
              .describe("Address details"),
            reviews: z
              .array(
                z.object({
                  id: z
                    .string()
                    .uuid()
                    .describe("Unique identifier for the review"),
                  rating: z.coerce
                    .string()
                    .describe("Rating given to the service (1.0 to 5.0)"),
                  comment: z
                    .string()
                    .nullable()
                    .describe("Comment about the service"),
                  createdAt: z
                    .string()
                    .datetime()
                    .describe("Date and time when the review was created"),
                  client: z
                    .object({
                      id: z
                        .string()
                        .uuid()
                        .describe("Unique identifier for the client"),
                      individual: z
                        .object({
                          fullName: z
                            .string()
                            .describe("Full name of the individual client"),
                        })
                        .nullable()
                        .describe("Individual client details"),
                      company: z
                        .object({
                          corporateName: z
                            .string()
                            .describe("Corporate name of the company client"),
                        })
                        .nullable()
                        .describe("Company client details"),
                      photoUrl: z
                        .string()
                        .nullable()
                        .describe("URL of the client's profile photo"),
                    })
                    .describe("Client who wrote the review"),
                })
              )
              .describe("List of reviews for the service"),
            })
          ),
          404: createErrorResponseSchema(),
          400: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => serviceController.fetchById(request, reply)
  );

  server.post(
    "/",
    {
      schema: {
        summary: "Create a new service",
        description: "Endpoint to create a new service",
        tags: ["Service"],
        body: createServiceSchema,
        response: {
          201: createApiResponseSchema(
            z.object({
              id: z.string().uuid().describe("Unique identifier for the service"),
            })
          ),
          400: createErrorResponseSchema(),
          500: createErrorResponseSchema(),
        },
      },
    },
    async (request, reply) => serviceController.create(request, reply)
  );
}
