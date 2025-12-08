import { LocationRepository } from "../repository/location.repository";

export class LocationService {
  constructor(private readonly locationRepository: LocationRepository) {}

  async getStates() {
    return this.locationRepository.fetchStatesByCountry("Brasil");
  }

  async getCitiesByState(stateId: string) {
    const state = await this.locationRepository.findStateById(stateId);

    if (!state) {
      throw new Error("404");
    }

    return this.locationRepository.fetchCitiesByState(stateId);
  }
}
