// app/api/teachers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth, clerkClient } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

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

    // Find the teacher first (to grab Clerk ID)
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      return NextResponse.json({ error: 'teacher not found' }, { status: 404 });
    }

    // Delete the teacher in DB
    await prisma.teacher.delete({
      where: { id },
    });

    // Delete Clerk user if linked
    if (teacher.clerkId) {
      await clerkClient.users.deleteUser(teacher.clerkId);
    }

    return NextResponse.json({
      message: 'teacher and Clerk user deleted successfully',
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    return NextResponse.json(
      { error: 'Failed to delete teacher' },
      { status: 500 }
    );
  }
}
