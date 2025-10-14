export const dynamic = 'force-dynamic';
// app/api/grades/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get("gradeId");

    if (gradeId) {
      const grade = await prisma.grade.findUnique({
        where: { id: gradeId },
        include: {
          classes: true,
          students: true,
        },
      });
      return NextResponse.json(grade);
    }

    const grades = await prisma.grade.findMany({
      include: {
        _count: {
          select: {
            students: true,
            classes: true,
          },
        },
      },
      orderBy: {
        level: "asc",
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { level, description } = body;

    const grade = await prisma.grade.create({
      data: {
        level: parseInt(level),
        description,
      },
    });

    return NextResponse.json(grade);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create grade" },
      { status: 500 }
    );
  }
}