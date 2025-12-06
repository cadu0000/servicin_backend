import { AuthRepository } from "../repository/auth.repository";
import { ServiceRepository } from "../repository/service.repository";
import { prisma } from "../lib/prisma";
import {
  CreateServiceSchemaDTO,
  FetchServicesQueryParamsDTO,
} from "../schemas/service.schema";

export class ServiceService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async fetch(fetchServicesQueryParamsDTO: FetchServicesQueryParamsDTO) {
    const services = await this.serviceRepository.fetch(
      fetchServicesQueryParamsDTO
    );

    if (!services) {
      throw new Error("No services found");
    }

    const servicesWithUnavailableSlots = services.data.map((service) => {
      const unavailableTimeSlots = (service.appointments || []).map(
        (appointment) => {
          const startDate = new Date(appointment.scheduledStartTime);
          const endDate = new Date(appointment.scheduledEndTime);

          const startTime = `${startDate
            .getHours()
            .toString()
            .padStart(2, "0")}:${startDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

          const endTime = `${endDate
            .getHours()
            .toString()
            .padStart(2, "0")}:${endDate
            .getMinutes()
            .toString()
            .padStart(2, "0")}`;

          return {
            start: startTime,
            end: endTime,
            date: startDate.toISOString().split("T")[0],
          };
        }
      );

      const { appointments, ...serviceWithoutAppointments } = service;
      return {
        ...serviceWithoutAppointments,
        unavailableTimeSlots,
      };
    });

    return {
      ...services,
      data: servicesWithUnavailableSlots,
    };
  }

  async fetchById(id: string) {
    const service = await this.serviceRepository.fetchById(id);

    if (!service) {
      throw new Error("No service found");
    }

    const unavailableTimeSlots = (service.appointments || []).map(
      (appointment) => {
        const startDate = new Date(appointment.scheduledStartTime);
        const endDate = new Date(appointment.scheduledEndTime);

        const startTime = `${startDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${startDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        const endTime = `${endDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${endDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        return {
          start: startTime,
          end: endTime,
          date: startDate.toISOString().split("T")[0],
          appointmentId: appointment.id,
          status: appointment.status,
        };
      }
    );

    const { appointments, ...serviceWithoutAppointments } = service;
    return {
      ...serviceWithoutAppointments,
      unavailableTimeSlots,
    };
  }

  async create(createServiceSchemaDTO: CreateServiceSchemaDTO) {
    const { categoryId, providerId, addressId } = createServiceSchemaDTO;

    const userAlreadyExists = await this.authRepository.findById(providerId);

    if (!userAlreadyExists) {
      throw new Error("User does not exist");
    }

    const serviceProviderExists = await this.authRepository.findById(
      providerId
    );

    if (!serviceProviderExists) {
      throw new Error("User is not a service provider");
    }

    const categoryExists = await this.serviceRepository.findCategoryById(
      categoryId
    );

    if (!categoryExists) {
      throw new Error("Category does not exist");
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("Address does not exist");
    }

    const service = await this.serviceRepository.create(createServiceSchemaDTO);

    if (!service) {
      throw new Error("Error creating service");
    }

    return service;
  }
}
