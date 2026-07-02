const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('12345678', 10);
  await prisma.user.update({
    where: { email: 'babadivyanshu007@gmail.com' },
    data: { password: hashedPassword }
  });
  console.log('Password reset to 12345678');
}

main().finally(() => prisma.$disconnect());
