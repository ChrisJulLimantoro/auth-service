// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcrypt';

// const prisma = new PrismaClient();

// async function main() {
//   // Create default companies
//   const data = await prisma.user.findFirst({
//     where: {
//       email: 'christian@gmail.com',
//     },
//   });
//   if (data) {
//     console.log('User already exists, skipping creation');
//     return;
//   }
//   const user1 = await prisma.user.create({
//     data: {
//       email: 'christian@gmail.com',
//       password: await bcrypt.hashSync('password', 10),
//       is_owner: true,
//     },
//   });

//   // Send this to RabbitMQ for the other services to consume

//   console.log('Seed data created:', { user1 });
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
