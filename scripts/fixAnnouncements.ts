// scripts/fixAnnouncements.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAnnouncements() {
  try {
    console.log("🔄 Fixing announcements with missing authorId...");

    // 1. Get ANY user for default assignment
    let defaultUser = await prisma.user.findFirst();

    if (!defaultUser) {
      console.log("⚠️ No users found. Creating system default user...");
      defaultUser = await prisma.user.create({
        data: {
          clerkId: "system_default",
          username: "system",
          name: "System",
          surname: "Admin",
          role: "ADMIN",
        },
      });
      console.log("✅ Created system default user");
    }

    // 2. Fix announcements
    const result = await prisma.announcement.updateMany({
      where: {
        OR: [
          { authorId: "" }, // Empty string
          {
            // Records created before prisma where authorId was missing or null
            authorId: { not: undefined },
          },
        ],
      },
      data: {
        authorId: defaultUser.id,
      },
    });

    console.log(`✅ Updated ${result.count} announcements`);
  } catch (error) {
    console.error("❌ Error fixing announcements:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAnnouncements();
