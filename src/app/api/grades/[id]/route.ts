// app/api/grades/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if grade has classes or students before deleting
    const gradeWithRelations = await prisma.grade.findUnique({
      where: { id },
      include: {
        classes: true,
        students: true,
      },
    });

    if (!gradeWithRelations) {
      return NextResponse.json(
        { error: "Grade not found" },
        { status: 404 }
      );
    }

    if (gradeWithRelations.classes.length > 0 || gradeWithRelations.students.length > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete grade with existing classes or students. Please reassign them first." 
        },
        { status: 400 }
      );
    }

    await prisma.grade.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting grade:", error);
    return NextResponse.json(
      { error: "Failed to delete grade" },
      { status: 500 }
    );
  }
}