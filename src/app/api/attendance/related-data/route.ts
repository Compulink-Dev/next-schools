// app/api/attendance/related-data/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId, sessionClaims } = auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build query conditions based on role
    const lessonWhere: any = {};
    const studentWhere: any = {};

    if (role === "teacher") {
      lessonWhere.teacherId = userId;
      // For teachers, only show students from their classes
      studentWhere.class = {
        lessons: {
          some: {
            teacherId: userId
          }
        }
      };
    } else if (role === "student") {
      studentWhere.id = userId;
    } else if (role === "parent") {
      studentWhere.parentId = userId;
    }

    const [lessons, students] = await Promise.all([
      prisma.lesson.findMany({
        where: lessonWhere,
        include: {
          subject: true,
          class: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.student.findMany({
        where: studentWhere,
        select: {
          id: true,
          name: true,
          surname: true,
          class: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })
    ]);

    // Transform lessons data
    const formattedLessons = lessons.map(lesson => ({
      id: lesson.id,
      name: `${lesson.subject.name} - ${lesson.class.name}`
    }));

    // Transform students data
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.name,
      surname: student.surname,
      className: student.class?.name || 'No Class'
    }));

    return NextResponse.json({
      success: true,
      data: {
        lessons: formattedLessons,
        students: formattedStudents
      }
    });

  } catch (error) {
    console.error('Error fetching related data:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}