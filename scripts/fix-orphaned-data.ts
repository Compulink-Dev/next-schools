// scripts/fix-orphaned-data.ts
import prisma from "@/lib/prisma";

async function fixOrphanedTeacherRelations() {
  console.log("Finding orphaned TeacherSubject records...");
  
  // Get all TeacherSubject records
  const allTeacherSubjects = await prisma.teacherSubject.findMany();
  
  // Find which ones have non-existent subjects
  const orphanedTeacherSubjects = [];
  
  for (const ts of allTeacherSubjects) {
    try {
      const subject = await prisma.subject.findUnique({
        where: { id: ts.subjectId }
      });
      
      if (!subject) {
        // Get teacher info for logging
        const teacher = await prisma.teacher.findUnique({
          where: { id: ts.teacherId }
        });
        orphanedTeacherSubjects.push({ ...ts, teacher });
      }
    } catch (error) {
      console.error(`Error checking subject ${ts.subjectId}:`, error);
    }
  }

  console.log(`Found ${orphanedTeacherSubjects.length} orphaned TeacherSubject records`);
  
  // Delete the orphaned records
  for (const ts of orphanedTeacherSubjects) {
    console.log(`Deleting orphaned TeacherSubject for teacher: ${ts.teacher?.name || 'Unknown'}`);
    await prisma.teacherSubject.delete({
      where: { id: ts.id }
    });
  }

  console.log("Finding orphaned TeacherClass records...");
  
  // Get all TeacherClass records
  const allTeacherClasses = await prisma.teacherClass.findMany();
  
  // Find which ones have non-existent classes
  const orphanedTeacherClasses = [];
  
  for (const tc of allTeacherClasses) {
    try {
      const classRecord = await prisma.class.findUnique({
        where: { id: tc.classId }
      });
      
      if (!classRecord) {
        // Get teacher info for logging
        const teacher = await prisma.teacher.findUnique({
          where: { id: tc.teacherId }
        });
        orphanedTeacherClasses.push({ ...tc, teacher });
      }
    } catch (error) {
      console.error(`Error checking class ${tc.classId}:`, error);
    }
  }

  console.log(`Found ${orphanedTeacherClasses.length} orphaned TeacherClass records`);
  
  // Delete the orphaned records
  for (const tc of orphanedTeacherClasses) {
    console.log(`Deleting orphaned TeacherClass for teacher: ${tc.teacher?.name || 'Unknown'}`);
    await prisma.teacherClass.delete({
      where: { id: tc.id }
    });
  }

  console.log("Cleanup completed!");
}

// Run the script
fixOrphanedTeacherRelations()
  .catch(console.error)
  .finally(() => process.exit(0));