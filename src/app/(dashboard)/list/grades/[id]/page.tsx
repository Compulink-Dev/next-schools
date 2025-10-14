// app/list/grades/[id]/page.tsx
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Grade, Class, Student, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type GradeWithRelations = Grade & {
  classes: (Class & {
    supervisor?: Teacher | null;
    _count: {
      students: number;
      lessons: number;
    };
  })[];
  students: (Student & {
    class?: Class | null;
    parent?: { name: string; surname: string } | null;
  })[];
  _count: {
    students: number;
    classes: number;
  };
};

const SingleGradePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const grade: GradeWithRelations | null = await prisma.grade.findUnique({
    where: { id },
    include: {
      classes: {
        include: {
          supervisor: true,
          _count: {
            select: {
              students: true,
              lessons: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      students: {
        include: {
          class: true,
          parent: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      _count: {
        select: {
          students: true,
          classes: true,
        },
      },
    },
  });

  if (!grade) {
    return notFound();
  }

  // Calculate grade statistics
  const studentCount = grade._count.students;
  const classCount = grade._count.classes;
  const totalCapacity = grade.classes.reduce(
    (sum, classItem) => sum + classItem.capacity,
    0
  );
  const occupancyRate =
    totalCapacity > 0 ? (studentCount / totalCapacity) * 100 : 0;

  // Get unique teachers in this grade
  const teachers = Array.from(
    new Set(
      grade.classes
        .map((classItem) => classItem.supervisor)
        .filter(Boolean)
        .map((teacher) => `${teacher!.name} ${teacher!.surname}`)
    )
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* GRADE INFO CARD */}
          <div className="bg-purple-100 py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-purple-200 flex items-center justify-center">
                <span className="font-bold text-purple-800 text-4xl">
                  {grade.level}
                </span>
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Grade {grade.level}</h1>
                {role === "admin" && (
                  <FormContainer table="grade" type="update" data={grade} />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {grade.description || "No description provided"}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/student.png" alt="" width={14} height={14} />
                  <span>
                    {studentCount} Student{studentCount !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>
                    {classCount} Class{classCount !== 1 ? "es" : ""}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/capacity.png" alt="" width={14} height={14} />
                  <span>{totalCapacity} Total Capacity</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/teacher.png" alt="" width={14} height={14} />
                  <span>
                    {teachers.length} Teacher{teachers.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* OCCUPANCY PROGRESS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Grade Occupancy</h3>
            <span className="text-sm text-gray-600">
              {studentCount} / {totalCapacity} students (
              {occupancyRate.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className={`h-4 rounded-full ${
                occupancyRate >= 90
                  ? "bg-red-600"
                  : occupancyRate >= 75
                  ? "bg-yellow-600"
                  : "bg-green-600"
              }`}
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {occupancyRate >= 90
              ? "Grade is nearly full"
              : occupancyRate >= 75
              ? "Grade has good occupancy"
              : "Grade has available seats"}
          </p>
        </div>

        {/* CLASSES SECTION */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Classes ({classCount})</h2>
            <Link
              href={`/list/classes?gradeId=${grade.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          {grade.classes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grade.classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex items-center gap-3 p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="font-semibold text-green-800">
                      {classItem.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{classItem.name}</h3>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>
                        <strong>Students:</strong> {classItem._count.students} /{" "}
                        {classItem.capacity}
                      </p>
                      <p>
                        <strong>Lessons:</strong> {classItem._count.lessons}
                      </p>
                      {classItem.supervisor && (
                        <p>
                          <strong>Supervisor:</strong>{" "}
                          {classItem.supervisor.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/list/classes/${classItem.id}`}
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
                src="/no-classes.png"
                alt="No classes"
                width={64}
                height={64}
                className="mx-auto mb-2 opacity-50"
              />
              <p>No classes in this grade</p>
            </div>
          )}
        </div>

        {/* STUDENTS SECTION */}
        <div className="mt-4 bg-white rounded-md p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Students ({studentCount})</h2>
            <Link
              href={`/list/students?gradeId=${grade.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          {grade.students.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {grade.students.slice(0, 6).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-semibold text-blue-800">
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
                    {student.class && (
                      <p className="text-xs text-gray-400">
                        Class: {student.class.name}
                      </p>
                    )}
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
              <p>No students in this grade</p>
            </div>
          )}
          {grade.students.length > 6 && (
            <div className="text-center mt-4">
              <Link
                href={`/list/students?gradeId=${grade.id}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all {grade.students.length} students
              </Link>
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
              href={`/list/classes?gradeId=${grade.id}`}
            >
              View All Classes
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/students?gradeId=${grade.id}`}
            >
              View All Students
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/teachers?gradeId=${grade.id}`}
            >
              View Grade Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/lessons?gradeId=${grade.id}`}
            >
              View Grade Lessons
            </Link>
          </div>
        </div>

        {/* GRADE STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Grade Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Students</span>
              <span className="font-semibold">{studentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Classes</span>
              <span className="font-semibold">{classCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Capacity</span>
              <span className="font-semibold">{totalCapacity}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Occupancy Rate</span>
              <span className="font-semibold">{occupancyRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Teachers</span>
              <span className="font-semibold">{teachers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Grade ID</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                {grade.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>

        {/* TEACHERS IN GRADE */}
        {teachers.length > 0 && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">
              Teachers in Grade {grade.level}
            </h2>
            <div className="space-y-3">
              {teachers.slice(0, 5).map((teacher, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 border border-gray-200 rounded-md"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-semibold text-blue-800 text-xs">
                      {teacher.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium">{teacher}</span>
                </div>
              ))}
              {teachers.length > 5 && (
                <div className="text-center">
                  <Link
                    href={`/list/teachers?gradeId=${grade.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all {teachers.length} teachers
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* GRADE DESCRIPTION */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Grade Description</h2>
          <p className="text-sm text-gray-600">
            {grade.description || "No description available for this grade."}
          </p>
        </div>

        {/* ACTION BUTTONS FOR ADMIN */}
        {role === "admin" && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Manage Grade</h2>
            <div className="space-y-2">
              <FormContainer table="grade" type="update" data={grade} />
              <Link
                href={`/list/classes?gradeId=${grade.id}`}
                className="w-full block text-center bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
              >
                Create New Class
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleGradePage;
