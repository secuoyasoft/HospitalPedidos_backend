// prisma/seed.js
const { PrismaClient, Enum_Role } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Obtener credenciales desde las variables de entorno
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("❌ ERROR: ADMIN_EMAIL o ADMIN_PASSWORD no están definidos en las variables de entorno.");
    process.exit(1);
  }

  // Crear usuario admin
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.create({
    data: {
      full_name: 'Administrador Principal',
      position: 'Administrador del Sistema',
      role: Enum_Role.ADMINISTRATOR,
      email: adminEmail,
      phone: '78945612',
      password: hashedPassword,
    },
  });

  console.log('Usuario administrador creado exitosamente!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
