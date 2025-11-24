// scripts/fixBloodTypes.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBloodTypes() {
  try {
    console.log('🔄 Fixing bloodType issues...');
    
    // Update students with null or empty bloodType
    const studentResult = await prisma.student.updateMany({
      where: {
        OR: [
          { bloodType: null },
          { bloodType: '' }
        ]
      },
      data: {
        bloodType: 'Not specified'
      }
    });
    
    console.log(`✅ Updated ${studentResult.count} students with null bloodType`);
    
    // For Teacher and Parent, we need to handle the type issue
    // First, let's check if we can query with null
    try {
      const teacherResult = await prisma.teacher.updateMany({
        where: {
          OR: [
            { bloodType: null },
            { bloodType: '' }
          ]
        },
        data: {
          bloodType: 'Not specified'
        }
      });
      console.log(`✅ Updated ${teacherResult.count} teachers with null bloodType`);
    } catch (teacherError) {
      console.log('⚠️  Teacher update failed, trying alternative approach...');
      // Alternative approach for Teacher
      await fixTeachersAlternative();
    }
    
    try {
      const parentResult = await prisma.parent.updateMany({
        where: {
          OR: [
            { bloodType: null },
            { bloodType: '' }
          ]
        },
        data: {
          bloodType: 'Not specified'
        }
      });
      console.log(`✅ Updated ${parentResult.count} parents with null bloodType`);
    } catch (parentError) {
      console.log('⚠️  Parent update failed, trying alternative approach...');
      // Alternative approach for Parent
      await fixParentsAlternative();
    }
    
    console.log('🎉 Blood type fix completed!');
    
  } catch (error) {
    console.error('❌ Error updating blood types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative approach for Teacher
async function fixTeachersAlternative() {
  try {
    // Get all teachers first, then update individually
    const teachers = await prisma.teacher.findMany({
      where: {
        OR: [
          { bloodType: null },
          { bloodType: '' }
        ]
      }
    });
    
    let updatedCount = 0;
    for (const teacher of teachers) {
      await prisma.teacher.update({
        where: { id: teacher.id },
        data: { bloodType: 'Not specified' }
      });
      updatedCount++;
    }
    
    console.log(`✅ Updated ${updatedCount} teachers using alternative method`);
  } catch (error) {
    console.error('❌ Alternative teacher update failed:', error);
  }
}

// Alternative approach for Parent
async function fixParentsAlternative() {
  try {
    // Get all parents first, then update individually
    const parents = await prisma.parent.findMany({
      where: {
        OR: [
          { bloodType: null },
          { bloodType: '' }
        ]
      }
    });
    
    let updatedCount = 0;
    for (const parent of parents) {
      await prisma.parent.update({
        where: { id: parent.id },
        data: { bloodType: 'Not specified' }
      });
      updatedCount++;
    }
    
    console.log(`✅ Updated ${updatedCount} parents using alternative method`);
  } catch (error) {
    console.error('❌ Alternative parent update failed:', error);
  }
}

fixBloodTypes();