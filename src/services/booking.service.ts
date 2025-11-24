import { AuthRepository } from "../repository/auth.repository";
import { BookingRepository } from "../repository/booking.repository";
import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { ServiceRepository } from "../repository/service.repository";
import { CreateBookingDTO, ResponseBookingDTO } from "../schemas/booking.schema";
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export class BookingService {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly userRepository: AuthRepository,
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly bookingRepository: BookingRepository
  ) {}
  
  async book(data: CreateBookingDTO): Promise<ResponseBookingDTO> {
    const { serviceId, customerId, scheduledStart, notes } = data;

    const service = await this.serviceRepository.fetchById(serviceId);
      if (!service) throw new Error("Service does not exist");

    const user = await this.userRepository.findById(customerId);
      if (!user) throw new Error("User does not exist");

    if (!service.providers || service.providers.length === 0) {
      throw new Error("No provider linked to this service");
    }

    const providerId = service.providers[0].provider.user.id;
    
    const localTimezone = 'America/Sao_Paulo'; 
    const scheduledStartLocal = dayjs.utc(scheduledStart).tz(localTimezone).toISOString();

    const available = await this.serviceProviderRepository.isProviderAvailable(
      providerId,
      scheduledStartLocal
    );
    if (!available) throw new Error("Provider is not available at this time");

    const booking = await this.bookingRepository.bookingService(
      serviceId,
      customerId,
      providerId,
      scheduledStart,
      notes
    );

    const responseBooking: ResponseBookingDTO = {
        id: booking.id,
        clientId: booking.clientId,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        dateTime: booking.dateTime.toISOString(),
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
    };

    return responseBooking;
  }
}