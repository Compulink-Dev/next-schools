import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Class,
  Teacher,
  Student,
  Grade,
  Lesson,
  Subject,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ClassWithRelations = Class & {
  supervisor?: Teacher | null;
  grade?: Grade | null;
  students: (Student & {
    parent?: { name: string; surname: string } | null;
  })[];
  lessons: (Lesson & {
    subject: Subject;
    teacher: Teacher;
  })[];
  _count: {
    students: number;
    lessons: number;
  };
};

const SingleClassPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const classItem: ClassWithRelations | null = await prisma.class.findUnique({
    where: { id },
    include: {
      supervisor: true,
      grade: true,
      students: {
        include: {
          parent: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      lessons: {
        include: {
          subject: true,
          teacher: true,
        },
        orderBy: {
          day: "asc",
        },
      },
      _count: {
        select: {
          students: true,
          lessons: true,
        },
      },
    },
  });

  if (!classItem) {
    return notFound();
  }

  // Calculate class statistics
  const studentCount = classItem._count.students;
  const lessonCount = classItem._count.lessons;
  const capacityPercentage = (studentCount / classItem.capacity) * 100;
  const uniqueSubjects = new Set(
    classItem.lessons.map((lesson) => lesson.subjectId)
  ).size;

  // Group lessons by day for schedule
  const lessonsByDay = classItem.lessons.reduce((acc, lesson) => {
    if (!acc[lesson.day]) {
      acc[lesson.day] = [];
    }
    acc[lesson.day].push(lesson);
    return acc;
  }, {} as Record<string, typeof classItem.lessons>);

  // Sort days in logical order
  const dayOrder = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  const sortedDays = Object.keys(lessonsByDay).sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* CLASS INFO CARD */}
          <div className="bg-lamaSkyLight py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-green-100 flex items-center justify-center">
                <span className="font-bold text-green-800 text-4xl">
                  {classItem.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{classItem.name}</h1>
                {role === "admin" && (
                  <FormContainer table="class" type="update" data={classItem} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {classItem.grade
                  ? `Grade ${classItem.grade.level} Classroom`
                  : "Classroom"}{" "}
                • {classItem.description || "No description provided"}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/student.png" alt="" width={14} height={14} />
                  <span>
                    {studentCount} Student{studentCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/lesson.png" alt="" width={14} height={14} />
                  <span>
                    {lessonCount} Lesson{lessonCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/capacity.png" alt="" width={14} height={14} />
                  <span>{classItem.capacity} Capacity</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/teacher.png" alt="" width={14} height={14} />
                  <span>
                    {classItem.supervisor
                      ? `${classItem.supervisor.name} ${classItem.supervisor.surname}`
                      : "No supervisor"}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/grade.png" alt="" width={14} height={14} />
                  <span>
                    {classItem.grade
                      ? `Grade ${classItem.grade.level}`
                      : "No grade"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CAPACITY PROGRESS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Class Capacity</h3>
            <span className="text-sm text-gray-600">
              {studentCount} / {classItem.capacity} students (
              {capacityPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${
                capacityPercentage >= 90
                  ? "bg-red-600"
                  : capacityPercentage >= 75
                  ? "bg-yellow-600"
                  : "bg-green-600"
              }`}
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {capacityPercentage >= 90
              ? "Class is nearly full"
              : capacityPercentage >= 75
              ? "Class has good occupancy"
              : "Class has available seats"}
          </p>
        </div>

        {/* STUDENTS SECTION */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Students ({studentCount})</h2>
            <Link
              href={`/list/students?classId=${classItem.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          {classItem.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classItem.students.slice(0, 6).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="font-semibold text-purple-800">
                      {student.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {student.name} {student.surname}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {student.email || "No email"}
                    </p>
                    {student.parent && (
                      <p className="text-xs text-gray-400">
                        Parent: {student.parent.name}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/list/students/${student.id}`}
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
                src="/no-students.png"
                alt="No students"
                width={64}
                height={64}
                className="mx-auto mb-2 opacity-50"
              />
              <p>No students enrolled in this class</p>
            </div>
          )}
          {classItem.students.length > 6 && (
            <div className="text-center mt-4">
              <Link
                href={`/list/students?classId=${classItem.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all {classItem.students.length} students
              </Link>
            </div>
          )}
        </div>

        {/* CLASS SCHEDULE */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Class Schedule</h2>
          {classItem.lessons.length > 0 ? (
            <div className="space-y-4">
              {sortedDays.map((day) => (
                <div key={day} className="border border-gray-200 rounded-md">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <h3 className="font-semibold text-gray-700 capitalize">
                      {day.toLowerCase()}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {lessonsByDay[day].map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-sm">
                                {lesson.name}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {lesson.subject.name}
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
                                {new Date(lesson.endTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                              <p>
                                <strong>Teacher:</strong> {lesson.teacher.name}{" "}
                                {lesson.teacher.surname}
                              </p>
                            </div>
                          </div>
                          <Link
                            href={`/list/lessons/${lesson.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View
                          </Link>
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
              <p>No lessons scheduled for this class</p>
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
              href={`/list/students?classId=${classItem.id}`}
            >
              View All Students
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/lessons?classId=${classItem.id}`}
            >
              View All Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/attendances?classId=${classItem.id}`}
            >
              View Attendance
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/exams?classId=${classItem.id}`}
            >
              View Exams
            </Link>
            {classItem.supervisor && (
              <Link
                className="p-3 rounded-md bg-green-50 hover:bg-green-100 transition-colors"
                href={`/list/teachers/${classItem.supervisor.id}`}
              >
                View Supervisor
              </Link>
            )}
          </div>
        </div>

        {/* CLASS STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Class Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Students</span>
              <span className="font-semibold">{studentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Class Capacity</span>
              <span className="font-semibold">{classItem.capacity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Weekly Lessons</span>
              <span className="font-semibold">{lessonCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subjects</span>
              <span className="font-semibold">{uniqueSubjects}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Class ID</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {classItem.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* SUPERVISOR INFO */}
        {classItem.supervisor && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Class Supervisor</h2>
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-md">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-semibold text-blue-800">
                  {classItem.supervisor.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">
                  {classItem.supervisor.name} {classItem.supervisor.surname}
                </h3>
                <p className="text-sm text-gray-500">
                  {classItem.supervisor.email}
                </p>
                <p className="text-xs text-gray-400">Class Supervisor</p>
              </div>
              <Link
                href={`/list/teachers/${classItem.supervisor.id}`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Profile
              </Link>
            </div>
          </div>
        )}

        {/* GRADE INFO */}
        {classItem.grade && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Grade Information</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Grade Level:</strong> {classItem.grade.level}
              </p>
              <p>
                <strong>Grade Description:</strong>{" "}
                {classItem.grade.description || "No description"}
              </p>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS FOR ADMIN */}
        {role === "admin" && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Manage Class</h2>
            <div className="space-y-2">
              <FormContainer table="class" type="update" data={classItem} />
              <Link
                href={`/list/lessons?classId=${classItem.id}`}
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

export default SingleClassPage;
