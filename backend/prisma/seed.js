import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding started...");

  // 1. Seed Roles
  const roles = [
    { name: "ADMIN", description: "Administrator with full access" },
    { name: "FLEET_MANAGER", description: "Fleet Manager" },
    { name: "DISPATCHER", description: "Dispatcher" },
    { name: "SAFETY_OFFICER", description: "Safety Officer" },
    { name: "FINANCIAL_ANALYST", description: "Financial Analyst" },
  ];

  const dbRoles = [];
  for (const role of roles) {
    const existing = await prisma.role.findUnique({
      where: { name: role.name },
    });
    if (!existing) {
      const created = await prisma.role.create({
        data: role,
      });
      console.log(`Created role: ${role.name}`);
      dbRoles.push(created);
    } else {
      console.log(`Role ${role.name} already exists`);
      dbRoles.push(existing);
    }
  }

  // 2. Seed Admin User
  const adminEmail = "admin@fleetflow.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminRole = dbRoles.find((r) => r.name === "ADMIN");
    if (!adminRole) {
      throw new Error("Admin role not found!");
    }

    const passwordHash = await bcrypt.hash("Admin@123", 10);
    const adminUser = await prisma.user.create({
      data: {
        fullName: "System Administrator",
        email: adminEmail,
        passwordHash,
        phone: "1234567890",
        roleId: adminRole.id,
        isActive: true,
      },
    });
    console.log(`Created admin user: ${adminEmail}`);
  } else {
    console.log(`Admin user ${adminEmail} already exists`);
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
