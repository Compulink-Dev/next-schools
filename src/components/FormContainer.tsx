import prisma from "@/lib/prisma";
import FormModal from "./FormModal";
import { auth } from "@clerk/nextjs/server";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "message";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  // Fetch related data based on the table type
  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "exam": {
      const lessons = await prisma.lesson.findMany({
        where: role === "teacher" ? { teacherId: currentUserId! } : undefined,
        select: { id: true, name: true },
      });
      relatedData = { lessons };
      break;
    }
      case "assignment":
        const assignmentLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      case "result":
        const students = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        const exams = await prisma.exam.findMany({
          select: { id: true, title: true },
        });
        const assignments = await prisma.assignment.findMany({
          select: { id: true, title: true },
        });
        relatedData = { students, exams, assignments };
        break;
      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        const lessonClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        const lessonTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { subjects: lessonSubjects, classes: lessonClasses, teachers: lessonTeachers };
        break;
      case "attendance":
        // Fetch lessons and students for the attendance form
        const attendanceLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        const attendanceStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { lessons: attendanceLessons, students: attendanceStudents };
        break;

      case "event":
        // Fetch classes for the event form
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;

      case "announcement":
        // Fetch classes for the announcement form
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;

      case "message":
        const messageClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: messageClasses };
        break;

      // PARENT CASE
      case "parent":
        const allStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });

        if (type === "update" && id) {
          // Fetch the *specific* parent data for updating
          const parent = await prisma.parent.findUnique({
            where: {
              id: String(id), // Ensure id is a string
            },
            include: {
              students: true,
            },
          });
          relatedData = { students: allStudents, parentData: parent };
        } else {
          // For create, just fetch the student list
          relatedData = { students: allStudents };
        }
        break;
    }
  }

  return (
    <div className="">
      <FormModal table={table} type={type} data={data} id={id} relatedData={relatedData} />
    </div>
  );
};

export default FormContainer;