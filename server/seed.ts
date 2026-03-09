import bcrypt from 'bcrypt';
import { prisma } from './src/config/adapter';

async function seed() {
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {
      password: adminPassword,
      role: 'ADMIN',
    },
    create: {
      name: 'Admin User',
      email: 'admin@test.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin user created/updated:');
  console.log(`   Admin  → email: admin@test.com | password: admin123`);

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
