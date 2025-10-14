import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Lesson,
  Class,
  Subject,
  Teacher,
  Student,
  Attendance,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type LessonWithRelations = Lesson & {
  subject: Subject;
  class: Class & {
    students: Student[];
  };
  teacher: Teacher;
  attendances: Attendance[];
};

const SingleLessonPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims, userId } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const lesson: LessonWithRelations | null = await prisma.lesson.findUnique({
    where: { id },
    include: {
      subject: true,
      class: {
        include: {
          students: true,
        },
      },
      teacher: true,
      attendances: {
        include: {
          student: true,
        },
        where: {
          date: new Date(), // Today's attendance
        },
      },
    },
  });

  if (!lesson) {
    return notFound();
  }

  // Calculate lesson statistics
  const totalStudents = lesson.class.students.length;
  const presentStudents = lesson.attendances.filter((a) => a.present).length;
  const absentStudents = lesson.attendances.filter((a) => !a.present).length;
  const attendancePercentage =
    totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;

  // Calculate lesson duration
  const startTime = new Date(lesson.startTime);
  const endTime = new Date(lesson.endTime);
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  ); // in minutes

  // Check if current user is the teacher of this lesson
  const isTeacher = lesson.teacherId === currentUserId;

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* LESSON INFO CARD */}
          <div className="bg-lamaSkyLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center">
                <Image src="/lesson.png" alt="Lesson" width={64} height={64} />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{lesson.name}</h1>
                {(role === "admin" || isTeacher) && (
                  <FormContainer table="lesson" type="update" data={lesson} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {lesson.subject.name} lesson for {lesson.class.name} class
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/subject.png" alt="" width={14} height={14} />
                  <span>{lesson.subject.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{lesson.class.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/teacher.png" alt="" width={14} height={14} />
                  <span>
                    {lesson.teacher.name} {lesson.teacher.surname}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/calendar.png" alt="" width={14} height={14} />
                  <span className="capitalize">{lesson.day}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/time.png" alt="" width={14} height={14} />
                  <span>
                    {startTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {endTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/duration.png" alt="" width={14} height={14} />
                  <span>{duration} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LESSON DETAILS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Lesson Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Schedule Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p>
                    <strong>Day:</strong>{" "}
                    <span className="capitalize">{lesson.day}</span>
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {startTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {endTime.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p>
                    <strong>Duration:</strong> {duration} minutes
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Subject:</strong> {lesson.subject.name}
                  </p>
                  <p>
                    <strong>Class:</strong> {lesson.class.name}
                  </p>
                  <p>
                    <strong>Teacher:</strong> {lesson.teacher.name}{" "}
                    {lesson.teacher.surname}
                  </p>
                </div>
              </div>
            </div>

            {lesson.description && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Lesson Description
                </h3>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {lesson.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ATTENDANCE SECTION - For teachers and admin */}
        {(role === "admin" || isTeacher) && (
          <div className="mt-4 bg-white rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Today's Attendance</h2>
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {presentStudents}
                </div>
                <div className="text-sm text-green-700">Present</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {absentStudents}
                </div>
                <div className="text-sm text-red-700">Absent</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {attendancePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700">Attendance Rate</div>
              </div>
            </div>

            {lesson.class.students.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-3">
                  Student Attendance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {lesson.class.students.map((student) => {
                    const attendance = lesson.attendances.find(
                      (a) => a.studentId === student.id
                    );
                    return (
                      <div
                        key={student.id}
                        className={`flex items-center justify-between p-3 border rounded-md ${
                          attendance
                            ? attendance.present
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="font-semibold text-purple-800 text-xs">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {student.name} {student.surname}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            attendance
                              ? attendance.present
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {attendance
                            ? attendance.present
                              ? "Present"
                              : "Absent"
                            : "Not Marked"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Quick Links</h1>
          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
              href={`/list/classes/${lesson.class.id}`}
            >
              Class Details
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/teachers/${lesson.teacher.id}`}
            >
              Teacher Profile
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/subjects/${lesson.subject.id}`}
            >
              Subject Details
            </Link>
            {(role === "admin" || isTeacher) && (
              <Link
                className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
                href={`/list/attendances?lessonId=${lesson.id}`}
              >
                View All Attendance
              </Link>
            )}
          </div>
        </div>

        {/* LESSON STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Lesson Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Class Size</span>
              <span className="font-semibold">{totalStudents} students</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="font-semibold">{duration} min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Day</span>
              <span className="font-semibold capitalize">{lesson.day}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time Slot</span>
              <span className="font-semibold">
                {startTime.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {(role === "admin" || isTeacher) && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Today's Attendance
                  </span>
                  <span className="font-semibold">
                    {attendancePercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Lesson ID</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {lesson.id.slice(0, 8)}...
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TEACHER INFO */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Teacher Information</h2>
          <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-semibold text-blue-800">
                {lesson.teacher.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">
                {lesson.teacher.name} {lesson.teacher.surname}
              </h3>
              <p className="text-sm text-gray-500">{lesson.teacher.email}</p>
              <p className="text-xs text-gray-400">Subject Teacher</p>
            </div>
            <Link
              href={`/list/teachers/${lesson.teacher.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Profile
            </Link>
          </div>
        </div>

        {/* ACTION BUTTONS FOR TEACHER/ADMIN */}
        {(role === "admin" || isTeacher) && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Lesson Actions</h2>
            <div className="space-y-2">
              <FormContainer table="lesson" type="update" data={lesson} />
              <Link
                href={`/list/attendances?lessonId=${lesson.id}`}
                className="w-full block text-center bg-lamaSky text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-lamaSkyDark transition-colors"
              >
                Take Attendance
              </Link>
              <Link
                href={`/list/exams?lessonId=${lesson.id}`}
                className="w-full block text-center bg-lamaPurple text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-lamaPurpleDark transition-colors"
              >
                Schedule Exam
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleLessonPage;
