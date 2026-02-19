// prisma/seed.ts
import { PrismaClient, Enum_Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear usuario admin por defecto
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.create({
    data: {
      full_name: 'Administrador Principal',
      position: 'Administrador del Sistema',
      role: Enum_Role.ADMINISTRATOR,
      email: 'admin@hospital.com',
      phone: '78945612',
      password: hashedPassword,
    },
  });

  // Crear usuario solicitante ejemplo
  const hashedPassword2 = await bcrypt.hash('solicitante123', 10);
  await prisma.user.create({
    data: {
      full_name: 'Pedro Solicitante',
      position: 'Jefe de Cocina',
      role: Enum_Role.ORDER_USER,
      email: 'pedro@hospital.com',
      phone: '78945612',
      password: hashedPassword2,
    },
  });

  // Crear usuario comprador ejemplo
  const hashedPassword3 = await bcrypt.hash('comprador123', 10);
  await prisma.user.create({
    data: {
      full_name: 'María Compradora',
      position: 'Encargada de Compras',
      role: Enum_Role.PURCHASE_USER,
      email: 'maria@hospital.com',
      phone: '78945612',
      password: hashedPassword3,
    },
  });

  console.log('Usuarios de ejemplo creados exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });