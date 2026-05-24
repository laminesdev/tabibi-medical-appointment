import { PrismaClient, Role, Gender } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@tabibi.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPass123";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const user = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      firstName: "System",
      lastName: "Admin",
      phone: "+15550000000",
      gender: Gender.MALE,
      role: Role.ADMIN,
      isVerified: true,
      isActive: true,
    },
  });

  await prisma.admin.create({
    data: { userId: user.id },
  });

  console.log(`Admin user created: ${adminEmail} / ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
