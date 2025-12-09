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
      throw new Error("Nenhum serviço encontrado");
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
      const contacts = service.provider.user?.contacts || [];
      const filteredContacts = service.provider.showContactInfo
        ? contacts
        : contacts.filter((contact) => contact.type !== "PHONE");

      const processedReviews = (service.reviews || []).map((review: any) => ({
        ...review,
        rating: review.rating ? String(review.rating) : "0",
        createdAt: review.createdAt
          ? new Date(review.createdAt).toISOString()
          : new Date().toISOString(),
      }));

      return {
        ...serviceWithoutAppointments,
        price: (service as any).price ? String((service as any).price) : "0",
        rating: (service as any).rating ? String((service as any).rating) : "0",
        provider: {
          ...service.provider,
          averageRating: (service.provider as any).averageRating
            ? String((service.provider as any).averageRating)
            : "0",
          user: {
            ...service.provider.user,
            contacts: filteredContacts,
          },
        },
        reviews: processedReviews,
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
      throw new Error("Serviço não encontrado");
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
    const contacts = service.provider.user?.contacts || [];
    const filteredContacts = service.provider.showContactInfo
      ? contacts
      : contacts.filter((contact) => contact.type !== "PHONE");

    const processedReviews = (service.reviews || []).map((review: any) => ({
      ...review,
      rating: review.rating ? String(review.rating) : "0",
      createdAt: review.createdAt
        ? new Date(review.createdAt).toISOString()
        : new Date().toISOString(),
    }));

    return {
      ...serviceWithoutAppointments,
      price: (service as any).price ? String((service as any).price) : "0",
      rating: (service as any).rating ? String((service as any).rating) : "0",
      provider: {
        ...service.provider,
        averageRating: (service.provider as any).averageRating
          ? String((service.provider as any).averageRating)
          : "0",
        user: {
          ...service.provider.user,
          contacts: filteredContacts,
        },
      },
      reviews: processedReviews,
      unavailableTimeSlots,
    };
  }

  async create(createServiceSchemaDTO: CreateServiceSchemaDTO) {
    const { categoryId, providerId, addressId } = createServiceSchemaDTO;

    const userAlreadyExists = await this.authRepository.findById(providerId);

    if (!userAlreadyExists) {
      throw new Error("Usuário não existe");
    }

    const serviceProviderExists = await this.authRepository.findById(
      providerId
    );

    if (!serviceProviderExists) {
      throw new Error("Usuário não é um prestador de serviços");
    }

    const categoryExists = await this.serviceRepository.findCategoryById(
      categoryId
    );

    if (!categoryExists) {
      throw new Error("Categoria não existe");
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("Endereço não existe");
    }

    const service = await this.serviceRepository.create(createServiceSchemaDTO);

    if (!service) {
      throw new Error("Erro ao criar serviço");
    }

    return service;
  }
}
