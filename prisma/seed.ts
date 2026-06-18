import { prisma } from '../src/lib/prisma';

async function main() {
  await prisma.allowedEmail.upsert({
    where: { email: 'ruslany@gmail.com' },
    update: {},
    create: { email: 'ruslany@gmail.com' },
  });

  await prisma.user.updateMany({
    where: { email: 'ruslany@gmail.com' },
    data: { isAdmin: true },
  });

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
