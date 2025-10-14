// app/api/teachers/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const parents = await prisma.parent.findMany({
      select: { id: true, name: true},
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(parents);
  } catch (error) {
    console.error('Failed to fetch parents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parents' },
      { status: 500 }
    );
  }
}