export const dynamic = 'force-dynamic';

// app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';


export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      select: { id: true, name: true},
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(subjects);
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    );
  }
}