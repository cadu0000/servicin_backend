import { AppointmentRepository } from "../repository/appointment.repository";
import { ServiceRepository } from "../repository/service.repository";
import { AuthRepository } from "../repository/auth.repository";
import { CreateAppointmentSchemaDTO } from "../schemas/appointment.shema";

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly authRepository: AuthRepository
  ) {}

  async createAppointment(createAppointmentDTO: CreateAppointmentSchemaDTO) {
    const { serviceId, clientId, scheduledAt } = createAppointmentDTO;

    const clientExists = await this.authRepository.findById(clientId);
    if (!clientExists) {
      throw new Error("Client ID not found.");
    }

    const serviceExists = await this.serviceRepository.fetchById(serviceId);
    if (!serviceExists) {
      throw new Error("Service ID not found.");
    }

    const serviceProviderId = serviceExists.providers[0].provider.user.id;

    if (serviceProviderId === clientId) {
      throw new Error("O cliente não pode agendar um serviço para si mesmo.");
    }

    if (scheduledAt.getDay() === 0) {
      throw new Error("Não é possível agendar serviços aos domingos.");
    }

    const appointment = await this.appointmentRepository.create(
      createAppointmentDTO
    );

    return appointment;
  }
}
