// app/api/messages/available-receivers/route.ts
export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [teachers, students, admins] = await Promise.all([
      prisma.teacher.findMany({
        select: {
          id: true,
          clerkId: true,
          name: true,
          surname: true,
        },
        orderBy: { name: 'asc' }
      }),
      prisma.student.findMany({
        select: {
          id: true,
          clerkId: true,
          name: true,
          surname: true,
        },
        orderBy: { name: 'asc' }
      }),
      prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: {
          id: true,
          clerkId: true,
          name: true,
          surname: true,
        },
        orderBy: { name: 'asc' }
      })
    ]);

    return NextResponse.json({
      teachers: teachers.filter(t => t.clerkId), // Only include teachers with Clerk IDs
      students: students.filter(s => s.clerkId), // Only include students with Clerk IDs
      admins: admins.filter(a => a.clerkId),     // Only include admins with Clerk IDs
    });

  } catch (error) {
    console.error('Error fetching available receivers:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}