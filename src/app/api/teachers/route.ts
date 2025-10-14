export const dynamic = 'force-dynamic';
// app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';


export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}