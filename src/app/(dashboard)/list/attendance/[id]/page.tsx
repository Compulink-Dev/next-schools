import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Attendance,
  Class,
  Lesson,
  Student,
  Subject,
  Teacher,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type AttendanceWithRelations = Attendance & {
  student: Student;
  lesson: Lesson & {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const SingleAttendancePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const attendance: AttendanceWithRelations | null =
    await prisma.attendance.findUnique({
      where: { id },
      include: {
        student: true,
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
      },
    });

  if (!attendance) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ATTENDANCE INFO CARD */}
          <div
            className={`py-6 px-4 rounded-md flex-1 flex gap-4 ${
              attendance.present
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="w-1/3">
              <div
                className={`w-36 h-36 rounded-full flex items-center justify-center ${
                  attendance.present ? "bg-green-100" : "bg-red-100"
                }`}
              >
                <Image
                  src={attendance.present ? "/present.png" : "/absent.png"}
                  alt={attendance.present ? "Present" : "Absent"}
                  width={64}
                  height={64}
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {attendance.present ? "Present" : "Absent"} -{" "}
                  {attendance.student.name} {attendance.student.surname}
                </h1>
                {(role === "admin" || role === "teacher") && (
                  <FormContainer
                    table="attendance"
                    type="update"
                    data={attendance}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Attendance record for {attendance.lesson.subject.name} class
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/student.png" alt="" width={14} height={14} />
                  <span>
                    {attendance.student.name} {attendance.student.surname}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/subject.png" alt="" width={14} height={14} />
                  <span>{attendance.lesson.subject.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{attendance.lesson.class.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/teacher.png" alt="" width={14} height={14} />
                  <span>
                    {attendance.lesson.teacher.name}{" "}
                    {attendance.lesson.teacher.surname}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-US").format(attendance.date)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/status.png" alt="" width={14} height={14} />
                  <span
                    className={`font-semibold ${
                      attendance.present ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {attendance.present ? "Present" : "Absent"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE DETAILS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Attendance Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Student Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {attendance.student.name} {attendance.student.surname}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {attendance.student.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {attendance.student.phone || "N/A"}
                </p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Lesson Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">Subject:</span>{" "}
                  {attendance.lesson.subject.name}
                </p>
                <p>
                  <span className="font-medium">Class:</span>{" "}
                  {attendance.lesson.class.name}
                </p>
                <p>
                  <span className="font-medium">Teacher:</span>{" "}
                  {attendance.lesson.teacher.name}{" "}
                  {attendance.lesson.teacher.surname}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Quick Links</h1>
          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
              href={`/list/students/${attendance.student.id}`}
            >
              Student Profile
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/lessons?classId=${attendance.lesson.class.id}`}
            >
              Class Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/attendances?studentId=${attendance.student.id}`}
            >
              Student's Attendance
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/attendances?classId=${attendance.lesson.class.id}`}
            >
              Class Attendance
            </Link>
          </div>
        </div>

        {/* STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Attendance Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`font-semibold ${
                  attendance.present ? "text-green-600" : "text-red-600"
                }`}
              >
                {attendance.present ? "Present" : "Absent"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date</span>
              <span className="font-semibold">
                {new Intl.DateTimeFormat("en-US").format(attendance.date)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Recorded</span>
              <span className="font-semibold">
                {attendance.date
                  ? new Intl.DateTimeFormat("en-US").format(attendance.date)
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAttendancePage;
