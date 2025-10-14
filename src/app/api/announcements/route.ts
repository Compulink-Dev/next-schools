// app/api/announcements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

// Force dynamic behavior
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const classId = searchParams.get('classId');
    const priority = searchParams.get('priority');

    // Build query conditions
    const where: any = {};

    if (classId) {
      where.classId = classId;
    }

    if (priority) {
      where.priority = priority;
    }

    // Add role-based filtering if needed
    const user = await prisma.teacher.findUnique({
      where: { clerkId: userId },
    });

    if (user) {
      // For teachers, show announcements for their classes and school-wide announcements
      where.OR = [
        { class: { supervisorId: user.id } },
        { classId: null },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, date, classId, priority } = body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        date: new Date(date),
        classId: classId || null,
        priority: priority || 'normal',
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}