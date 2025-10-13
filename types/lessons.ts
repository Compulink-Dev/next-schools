import { Lesson } from "@prisma/client";

export type LessonWithRelations = Lesson & {
  subject: { name: string };
  class: { name: string };
  teacher: { name: string; surname: string };
};
