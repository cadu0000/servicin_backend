import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  await prisma.category.deleteMany();

  const categories = [
    {
      name: "Encanamento",
      description:
        "Serviços relacionados a sistemas hidráulicos e reparos de encanamento.",
    },
    {
      name: "Elétrica",
      description: "Serviços relacionados a instalações e reparos elétricos.",
    },
    {
      name: "Limpeza",
      description: "Serviços de limpeza residencial e comercial.",
    },
    {
      name: "Paisagismo",
      description: "Serviços de jardinagem e manutenção de áreas verdes.",
    },
    {
      name: "Pintura",
      description: "Serviços de pintura interna e externa de edificações.",
    },
    {
      name: "Outros",
      description:
        "Serviços diversos que não se enquadram nas categorias acima.",
    },
  ];

  await prisma.category.createMany({ data: categories });
}

seed().then(() => {
  console.log("Seeding completed successfully.");
});
