// app/api/parents/[id]/route.ts
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

    // Find the parent first (to grab Clerk ID)
    const parent = await prisma.parent.findUnique({
      where: { id },
    });

    if (!parent) {
      return NextResponse.json({ error: 'parent not found' }, { status: 404 });
    }

    // Delete the parent in DB
    await prisma.parent.delete({
      where: { id },
    });

    // Delete Clerk user if linked
    if (parent.clerkId) {
      await clerkClient.users.deleteUser(parent.clerkId);
    }

    return NextResponse.json({
      message: 'parent and Clerk user deleted successfully',
    });
  } catch (error) {
    console.error('Delete parent error:', error);
    return NextResponse.json(
      { error: 'Failed to delete parent' },
      { status: 500 }
    );
  }
}
