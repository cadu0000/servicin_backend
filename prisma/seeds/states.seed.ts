import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export async function cleanStates() {
  console.log("🧹 Cleaning states...");

  try {
    await prisma.state.deleteMany();
    console.log("✅ States cleaned successfully.");
  } catch (error) {
    console.error("❌ Error cleaning states:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}

export async function seedStates() {
  console.log("🌱 Starting states seed...");

  try {
    const existingStates = await prisma.state.findMany();

    if (existingStates.length > 0) {
      console.log(
        `✅ States already exist (${existingStates.length} found), skipping...`
      );
      return;
    }

    const brasil = await prisma.country.findUnique({
      where: { name: "Brasil" },
    });

    if (!brasil) {
      throw new Error("Brasil not found. Please run countries seed first.");
    }

    const response = await fetch(
      "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch states from IBGE API: ${response.statusText}`
      );
    }

    const states: IBGEState[] = (await response.json()) as any;

    for (const state of states) {
      await prisma.state.create({
        data: {
          name: state.nome,
          countryId: brasil.id,
        },
      });
      console.log(`✅ Created state: ${state.nome}`);
    }

    console.log("✅ States seed completed successfully.");
  } catch (error) {
    console.error("❌ Error seeding states:");
    console.error({
      message: error instanceof Error ? error.message : "Unknown error",
      code: (error as any)?.code,
      meta: (error as any)?.meta,
    });
    throw error;
  }
}
