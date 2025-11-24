//@ts-nocheck
// app/api/announcements/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    
    const announcements = await prisma.announcement.findMany({
      take: limit ? parseInt(limit) : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            name: true,
            surname: true,
          }
        }
      }
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
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
    const { title, content, classId } = body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content: content || '',
        classId: classId || null,
        authorId: userId,
      },
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}