import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.movement.deleteMany();
  console.log('Movements cleared');
}
main().finally(() => prisma.$disconnect());
