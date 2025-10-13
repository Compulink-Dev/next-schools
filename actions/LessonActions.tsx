"use client";

import { Lesson, Subject, Class, Teacher } from "@prisma/client";
import FormContainer from "@/components/FormContainer";

type LessonWithRelations = Lesson & {
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

interface LessonActionsProps {
  lesson: LessonWithRelations;
  role?: string;
}

export const LessonActions = ({ lesson, role }: LessonActionsProps) => {
  if (role !== "admin") return null;

  return (
    <div className="flex items-center gap-2">
      <FormContainer table="lesson" type="update" data={lesson} />
      <FormContainer table="lesson" type="delete" id={lesson.id} />
    </div>
  );
};
