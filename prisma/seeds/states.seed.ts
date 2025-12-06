import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

export async function seedStates() {
  console.log("🌱 Starting states seed...");

  try {
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
      const existingState = await prisma.state.findUnique({
        where: { name: state.nome },
      });

      if (!existingState) {
        await prisma.state.create({
          data: {
            name: state.nome,
            countryId: brasil.id,
          },
        });
        console.log(`✅ Created state: ${state.nome}`);
      } else {
        console.log(`⏭️  State already exists: ${state.nome}`);
      }
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
