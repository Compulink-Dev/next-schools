export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Subject,
  Teacher,
  TeacherSubject,
  Class,
  Lesson,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type SubjectWithRelations = Subject & {
  teachers: (TeacherSubject & {
    teacher: Teacher;
  })[];
  lessons: (Lesson & {
    class: Class;
    teacher: Teacher;
  })[];
};

const SingleSubjectPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      teachers: { include: { teacher: true } },
      lessons: {
        include: { class: true, teacher: true },
        orderBy: { day: "asc" },
      },
    },
  });

  if (!subject) {
    return notFound();
  }

  // Calculate subject statistics
  const totalTeachers = subject.teachers.length;
  const totalLessons = subject.lessons.length;
  const totalClasses = new Set(subject.lessons.map((lesson) => lesson.classId))
    .size;

  // Group lessons by class for better organization
  const lessonsByClass = subject.lessons.reduce((acc, lesson) => {
    if (!acc[lesson.classId]) {
      acc[lesson.classId] = {
        class: lesson.class,
        lessons: [],
      };
    }
    acc[lesson.classId].lessons.push(lesson);
    return acc;
  }, {} as Record<string, { class: Class; lessons: (Lesson & { teacher: Teacher })[] }>);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* SUBJECT INFO CARD */}
          <div className="bg-lamaSkyLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-bold text-blue-800 text-4xl">
                  {subject.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{subject.name}</h1>
                {role === "admin" && (
                  <FormContainer table="subject" type="update" data={subject} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {subject.description ||
                  "No description provided for this subject"}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/teacher.png" alt="" width={14} height={14} />
                  <span>
                    {totalTeachers} Teacher{totalTeachers !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/lesson.png" alt="" width={14} height={14} />
                  <span>
                    {totalLessons} Lesson{totalLessons !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>
                    {totalClasses} Class{totalClasses !== 1 ? "es" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TEACHERS SECTION */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Assigned Teachers</h2>
            {role === "admin" && (
              <FormContainer table="subject" type="update" data={subject} />
            )}
          </div>
          {subject.teachers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subject.teachers.map((teacherSub) => (
                <div
                  key={teacherSub.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="font-semibold text-purple-800">
                      {teacherSub.teacher.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {teacherSub.teacher.name} {teacherSub.teacher.surname}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {teacherSub.teacher.email}
                    </p>
                  </div>
                  <Link
                    href={`/list/teachers/${teacherSub.teacher.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Image
                src="/no-teachers.png"
                alt="No teachers"
                width={64}
                height={64}
                className="mx-auto mb-2 opacity-50"
              />
              <p>No teachers assigned to this subject</p>
              {role === "admin" && (
                <p className="text-sm mt-1">
                  Assign teachers using the edit button above
                </p>
              )}
            </div>
          )}
        </div>

        {/* LESSONS SCHEDULE */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Lesson Schedule</h2>
          {subject.lessons.length > 0 ? (
            <div className="space-y-4">
              {Object.entries(lessonsByClass).map(([classId, classData]) => (
                <div
                  key={classId}
                  className="border border-gray-200 rounded-md"
                >
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-semibold text-gray-700">
                      {classData.class.name} Class
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {classData.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="border border-gray-200 rounded-md p-3 hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-sm capitalize">
                              {lesson.day}
                            </span>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {lesson.name}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>
                              <strong>Time:</strong>{" "}
                              {new Date(lesson.startTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}{" "}
                              -{" "}
                              {new Date(lesson.endTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p>
                              <strong>Teacher:</strong> {lesson.teacher.name}{" "}
                              {lesson.teacher.surname}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Image
                src="/no-lessons.png"
                alt="No lessons"
                width={64}
                height={64}
                className="mx-auto mb-2 opacity-50"
              />
              <p>No lessons scheduled for this subject</p>
              <p className="text-sm mt-1">
                Lessons will appear here when scheduled by teachers
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Quick Links</h1>
          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
              href={`/list/lessons?search=${encodeURIComponent(subject.name)}`}
            >
              View All {subject.name} Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/teachers?subject=${encodeURIComponent(
                subject.name
              )}`}
            >
              View {subject.name} Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/exams?search=${encodeURIComponent(subject.name)}`}
            >
              View {subject.name} Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/assignments?search=${encodeURIComponent(
                subject.name
              )}`}
            >
              View {subject.name} Assignments
            </Link>
          </div>
        </div>

        {/* SUBJECT STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Subject Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Teachers</span>
              <span className="font-semibold">{totalTeachers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Lessons</span>
              <span className="font-semibold">{totalLessons}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Classes Teaching</span>
              <span className="font-semibold">{totalClasses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subject ID</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {subject.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* SUBJECT DESCRIPTION */}
        {subject.description && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Subject Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {subject.description}
            </p>
          </div>
        )}

        {/* ACTION BUTTONS FOR ADMIN */}
        {role === "admin" && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Manage Subject</h2>
            <div className="space-y-2">
              <FormContainer table="subject" type="update" data={subject} />
              <Link
                href={`/list/lessons?subjectId=${subject.id}`}
                className="w-full block text-center bg-lamaSky text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-lamaSkyDark transition-colors"
              >
                Schedule New Lesson
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleSubjectPage;
