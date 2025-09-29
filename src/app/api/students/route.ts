// app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      select: { id: true, name: true},
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(students);
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}