export const dynamic = 'force-dynamic';
// app/api/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { sessionClaims } = auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Find the student first (to grab Clerk ID)
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete the student in DB
    await prisma.student.delete({
      where: { id },
    });

    // Delete Clerk user if linked
    if (student.clerkId) {
      await clerkClient.users.deleteUser(student.clerkId);
    }

    return NextResponse.json({
      message: 'Student and Clerk user deleted successfully',
    });
  } catch (error) {
    console.error('Delete Student error:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
