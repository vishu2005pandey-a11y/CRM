import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const superAdminEmail = "superadmin@crm.com";
  const superAdminPassword = await hash("SuperAdmin123!", 10);

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (!existingSuperAdmin) {
    const user = await prisma.user.create({
      data: {
        email: superAdminEmail,
        name: "Super Admin",
        password: superAdminPassword,
        role: "SUPER_ADMIN",
      },
    });
    console.log(`Created super admin user: ${user.email}`);
  } else {
    console.log("Super admin already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
