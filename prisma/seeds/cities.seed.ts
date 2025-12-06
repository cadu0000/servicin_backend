import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IBGECity {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

export async function seedCities() {
  console.log("🌱 Starting cities seed...");

  try {
    const states = await prisma.state.findMany({
      orderBy: { name: "asc" },
    });

    if (states.length === 0) {
      throw new Error("No states found. Please run states seed first.");
    }

    const IBGE_STATES_RESPONSE = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
    );

    if (!IBGE_STATES_RESPONSE.ok) {
      throw new Error(
        `Failed to fetch states from IBGE API: ${IBGE_STATES_RESPONSE.statusText}`
      );
    }

    const ibgeStates: Array<{ id: number; sigla: string; nome: string }> =
      (await IBGE_STATES_RESPONSE.json()) as any;

    const stateMap = new Map<string, string>();
    for (const state of states) {
      const ibgeState = ibgeStates.find((s) => s.nome === state.name);
      if (ibgeState) {
        stateMap.set(state.id, ibgeState.sigla);
      }
    }

    for (const state of states) {
      const uf = stateMap.get(state.id);

      if (!uf) {
        console.warn(`⚠️  Could not find UF for state: ${state.name}`);
        continue;
      }

      console.log(`📍 Fetching cities for state: ${state.name} (${uf})`);

      const citiesResponse = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      );

      if (!citiesResponse.ok) {
        console.warn(
          `⚠️  Failed to fetch cities for ${state.name}: ${citiesResponse.statusText}`
        );
        continue;
      }

      const cities: IBGECity[] = (await citiesResponse.json()) as any;

      const citiesToCreate = cities.slice(0, Math.max(10, cities.length));

      let createdCount = 0;
      let skippedCount = 0;

      for (const city of citiesToCreate) {
        const existingCity = await prisma.city.findFirst({
          where: {
            name: city.nome,
            stateId: state.id,
          },
        });

        if (!existingCity) {
          await prisma.city.create({
            data: {
              name: city.nome,
              stateId: state.id,
            },
          });
          createdCount++;
        } else {
          skippedCount++;
        }
      }

      console.log(
        `✅ State ${state.name}: Created ${createdCount} cities, skipped ${skippedCount}`
      );
    }

    console.log("✅ Cities seed completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding cities:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
