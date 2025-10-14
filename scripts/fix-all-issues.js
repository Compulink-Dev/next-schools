// scripts/fix-all-issues-mongodb.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixAllIssues() {
  const currentDate = new Date();

  try {
    console.log("Starting comprehensive database fix for MongoDB...");

    // FIX 1: Fix Teacher createdAt null values using raw MongoDB query
    console.log("\n=== Fixing Teacher createdAt values ===");

    // Use raw MongoDB query for Teacher
    const teacherResult = await prisma.$runCommandRaw({
      update: "Teacher",
      updates: [
        {
          q: {
            $or: [{ createdAt: null }, { createdAt: { $exists: false } }],
          },
          u: {
            $set: { createdAt: { $date: currentDate.toISOString() } },
          },
          multi: true,
        },
      ],
    });
    console.log(`✅ Teacher update result:`, teacherResult);

    // FIX 2: Find and handle Students with invalid class references
    console.log(
      "\n=== Checking for Students with invalid class references ==="
    );

    // Get all valid class IDs
    const validClasses = await prisma.class.findMany({
      select: { id: true },
    });
    const validClassIds = validClasses.map((c) => c.id);

    if (validClassIds.length === 0) {
      console.log("❌ No classes found. Please create classes first.");
      return;
    }

    // Find students with invalid classId using raw query
    const studentsWithInvalidClass = await prisma.$runCommandRaw({
      find: "Student",
      filter: {
        classId: { $nin: validClassIds },
      },
    });

    const invalidStudents = studentsWithInvalidClass.cursor.firstBatch || [];
    console.log(
      `Found ${invalidStudents.length} students with invalid class references`
    );

    if (invalidStudents.length > 0) {
      // Get a default class to assign
      const defaultClass = await prisma.class.findFirst();

      if (defaultClass) {
        console.log(`Assigning default class: ${defaultClass.name}`);

        // Update each student with invalid class reference
        for (const student of invalidStudents) {
          await prisma.$runCommandRaw({
            update: "Student",
            updates: [
              {
                q: { _id: student._id },
                u: {
                  $set: { classId: { $oid: defaultClass.id } },
                },
              },
            ],
          });
          console.log(`✅ Fixed student: ${student.name}`);
        }
      }
    }

    // FIX 3: Fix other models with createdAt issues using individual raw queries
    console.log("\n=== Fixing other models with createdAt issues ===");

    const modelsToFix = [
      "Announcement",
      "Attendance",
      "Event",
      "Exam",
      "Lesson",
      "Message",
      "Parent",
      "Subject",
      "Grade",
      "TeacherSubject",
      "Assignment",
      "Result",
      "Fee",
    ];

    for (const modelName of modelsToFix) {
      try {
        const result = await prisma.$runCommandRaw({
          update: modelName,
          updates: [
            {
              q: {
                $or: [{ createdAt: null }, { createdAt: { $exists: false } }],
              },
              u: {
                $set: { createdAt: { $date: currentDate.toISOString() } },
              },
              multi: true,
            },
          ],
        });
        console.log(
          `✅ Fixed ${modelName}:`,
          result.nModified || 0,
          "documents"
        );
      } catch (error) {
        console.log(`⚠️  Error fixing ${modelName}: ${error.message}`);
      }
    }

    console.log("\n🎉 Comprehensive fix completed!");
  } catch (error) {
    console.error("❌ Error during fix:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllIssues();
