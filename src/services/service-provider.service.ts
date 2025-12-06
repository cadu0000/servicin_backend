import { AuthRepository } from "../repository/auth.repository";
import { ServiceProviderRepository } from "../repository/service-provider.repository";
import { AppointmentRepository } from "../repository/appointment.repository";
import { CreateServiceProviderDTO } from "../schemas/service-provider.schema";
import {
  generateSlotTimeIntervals,
  isTimeIntervalIncluded,
  TimeInterval,
  toMinutes,
} from "../utils/slot";

export class ServiceProviderService {
  constructor(
    private readonly serviceProviderRepository: ServiceProviderRepository,
    private readonly authRepository: AuthRepository,
    private readonly appointmentRepository: AppointmentRepository
  ) {}
  async findById(id: string, date?: Date) {
    const serviceProvider = await this.serviceProviderRepository.findById(id);

    if (!serviceProvider) {
      throw new Error("Service provider not found");
    }

    const targetDate = date || new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await this.appointmentRepository.findProviderAppointmentsByDateRange(
      id,
      startOfDay,
      endOfDay
    );

    const consumedIntervals: TimeInterval[] = appointments.map((apt) => {
      const startDate = new Date(apt.scheduledStartTime);
      const endDate = new Date(apt.scheduledEndTime);

      const startTime = `${startDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${startDate.getMinutes().toString().padStart(2, "0")}`;

      const endTime = `${endDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;

      return { start: startTime, end: endTime };
    });

    const servicesWithSlots = serviceProvider.services.map((service) => {
      const availabilitiesWithSlots = service.availabilities.map(
        (availability) => {
          const dayOfWeek = targetDate.getDay();
          if (availability.dayOfWeek !== dayOfWeek) {
            return {
              ...availability,
              availableSlots: [],
            };
          }

          const slots = generateSlotTimeIntervals(
            availability.startTime,
            availability.endTime,
            availability.slotDuration,
            availability.breakStart,
            availability.breakEnd
          );

          const availableSlots = slots.filter((slot) => {
            const slotStartMinutes = toMinutes(slot);
            const slotEndMinutes = slotStartMinutes + availability.slotDuration;
            const slotHours = Math.floor(slotEndMinutes / 60);
            const slotMins = slotEndMinutes % 60;
            const slotEnd = `${slotHours.toString().padStart(2, "0")}:${slotMins
              .toString()
              .padStart(2, "0")}`;

            const slotInterval: TimeInterval = {
              start: slot,
              end: slotEnd,
            };

            return !isTimeIntervalIncluded(slotInterval, consumedIntervals);
          });

          return {
            ...availability,
            availableSlots,
          };
        }
      );

      return {
        ...service,
        availabilities: availabilitiesWithSlots,
      };
    });

    return {
      ...serviceProvider,
      services: servicesWithSlots,
    };
  }

  async create(params: CreateServiceProviderDTO) {
    const { userId } = params;

    const userAlreadyExists = await this.authRepository.findById(userId);

    if (!userAlreadyExists) {
      throw new Error("User not found");
    }

    const serviceProviderAlreadyExists =
      await this.serviceProviderRepository.findById(userId);

    if (serviceProviderAlreadyExists) {
      throw new Error("Service provider already exists for this user");
    }

    await this.serviceProviderRepository.create(params);
  }
}
