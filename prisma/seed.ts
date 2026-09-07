import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create default SuperAdmin
  const superAdminEmail = "superadmin@example.com";
  const superAdminPassword = "superadmin123";

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { email: superAdminEmail },
  });

  if (existingSuperAdmin) {
    console.log("SuperAdmin already exists");
  } else {
    const hashPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        password: hashPassword,
        role: Role.SUPERADMIN,
        name: "SuperAdmin",
      },
    });

    console.log("SuperAdmin created", superAdmin);
  }

  // Create default Admin
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin already exists");
  } else {
    const hashPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashPassword,
        role: Role.ADMIN,
        name: "Admin",
        subscription: {
          create: {
            isActive: true,
          },
        },
      },
    });

    console.log("Admin created", admin);
  }

  // Create default User
  const userEmail = "user@example.com";
  const userPassword = "user123";

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    console.log("User already exists");
  } else {
    const hashPassword = await bcrypt.hash(userPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashPassword,
        role: Role.USER,
        name: "User",
        subscription: {
          create: {
            isActive: true,
          },
        },
      },
    });

    console.log("User created", user);
  }

  console.log("Seeding completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });