const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { adminProfile: true }
  });
  console.log(users.map(u => ({ email: u.email, role: u.role, status: u.adminProfile?.status })));
}

main().finally(() => prisma.$disconnect());
