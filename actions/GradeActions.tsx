// lib/actions.ts - Add these grade actions
"use server";

import prisma from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { gradeSchema, GradeSchema } from "../lib/formValidationSchemas";

export const createGrade = async (data: GradeSchema) => {
  const validatedFields = gradeSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: true,
      message: "Invalid fields",
    };
  }

  const { level, description } = validatedFields.data;

  try {
    await prisma.grade.create({
      data: {
        level: Number(level),
        description,
      },
    });

    revalidatePath("/list/grades");
    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error("Error creating grade:", error);
    return {
      success: false,
      error: true,
    };
  }
};

export const updateGrade = async (data: GradeSchema) => {
  const validatedFields = gradeSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      success: false,
      error: true,
      message: "Invalid fields",
    };
  }

  const { id, level, description } = validatedFields.data;

  try {
    await prisma.grade.update({
      where: { id },
      data: {
        level: Number(level),
        description,
      },
    });

    revalidatePath("/list/grades");
    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error("Error updating grade:", error);
    return {
      success: false,
      error: true,
    };
  }
};

export const deleteGrade = async (data: { id: string }) => {
  const { id } = data;

  try {
    await prisma.grade.delete({
      where: { id },
    });

    revalidatePath("/list/grades");
    return {
      success: true,
      error: false,
    };
  } catch (error) {
    console.error("Error deleting grade:", error);
    return {
      success: false,
      error: true,
    };
  }
};
