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

export async function cleanCities() {
  console.log("🧹 Cleaning cities...");

  try {
    await prisma.city.deleteMany();
    console.log("✅ Cities cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning cities:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedCities() {
  console.log("🌱 Starting cities seed...");

  try {
    const existingCities = await prisma.city.findMany();

    if (existingCities.length > 0) {
      console.log(
        `✅ Cities already exist (${existingCities.length} found), skipping...`
      );
      return;
    }

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
      try {
        const uf = stateMap.get(state.id);

        if (!uf) {
          console.warn(`⚠️  Could not find UF for state: ${state.name}`);
          continue;
        }

        console.log(`📍 Fetching cities for state: ${state.name} (${uf})`);

        let citiesResponse;
        try {
          citiesResponse = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
          );
        } catch (fetchError) {
          console.warn(
            `⚠️  Network error fetching cities for ${state.name}: ${
              fetchError instanceof Error ? fetchError.message : "Unknown error"
            }`
          );
          continue;
        }

        if (!citiesResponse.ok) {
          console.warn(
            `⚠️  Failed to fetch cities for ${state.name}: ${citiesResponse.statusText}`
          );
          continue;
        }

        const cities: IBGECity[] = (await citiesResponse.json()) as any;

        const citiesToCreate = cities.slice(0, Math.max(10, cities.length));

        for (const city of citiesToCreate) {
          await prisma.city.create({
            data: {
              name: city.nome,
              stateId: state.id,
            },
          });
        }

        console.log(
          `✅ State ${state.name}: Created ${citiesToCreate.length} cities`
        );
      } catch (stateError) {
        console.warn(
          `⚠️  Error processing state ${state.name}: ${
            stateError instanceof Error ? stateError.message : "Unknown error"
          }`
        );
        continue;
      }
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
