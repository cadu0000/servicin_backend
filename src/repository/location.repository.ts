import { prisma } from "../lib/prisma";

export class LocationRepository {
  async fetchStatesByCountry(countryName: string) {
    const states = await prisma.state.findMany({
      where: {
        country: {
          name: countryName,
        },
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return states;
  }

  async fetchCitiesByState(stateId: string) {
    const cities = await prisma.city.findMany({
      where: {
        stateId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return cities;
  }

  async findStateById(stateId: string) {
    const state = await prisma.state.findUnique({
      where: {
        id: stateId,
      },
    });

    return state;
  }
}
