import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create default companies
  const user1 = await prisma.user.create({
    data: {
      email: 'christian@gmail.com',
      password: await bcrypt.hashSync('password', 10),
    },
  });

  console.log('Seed data created:', { user1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
