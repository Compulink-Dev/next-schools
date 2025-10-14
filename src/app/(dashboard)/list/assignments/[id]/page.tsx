//@ts-nocheck
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Assignment,
  Class,
  Subject,
  Teacher,
  Result,
  Student,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

type AssignmentWithRelations = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
  results: (Result & {
    student: Student;
  })[];
};

const SingleAssignmentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const assignment: AssignmentWithRelations | null =
    await prisma.assignment.findUnique({
      where: { id },
      include: {
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
        results: {
          include: {
            student: true,
          },
        },
      },
    });

  if (!assignment) {
    return notFound();
  }

  const now = new Date();
  const startDate = new Date(assignment.startDate);
  const dueDate = new Date(assignment.dueDate);

  let status = "Active";
  let statusColor = "text-green-600";

  if (now < startDate) {
    status = "Upcoming";
    statusColor = "text-blue-600";
  } else if (now > dueDate) {
    status = "Overdue";
    statusColor = "text-red-600";
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ASSIGNMENT INFO CARD */}
          <div className="bg-blue-200 py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center">
                <Image
                  src="/assignment.png"
                  alt="Assignment"
                  width={64}
                  height={64}
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{assignment.title}</h1>
                {(role === "admin" || role === "teacher") && (
                  <FormContainer
                    table="assignment"
                    type="update"
                    data={assignment}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {assignment.description || "No description provided"}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/subject.png" alt="" width={14} height={14} />
                  <span>{assignment.lesson.subject.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{assignment.lesson.class.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/teacher.png" alt="" width={14} height={14} />
                  <span>
                    {assignment.lesson.teacher.name}{" "}
                    {assignment.lesson.teacher.surname}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {format(new Date(assignment.startDate), "MM/dd/yyyy")}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/due.png" alt="" width={14} height={14} />
                  <span>
                    {format(new Date(assignment.dueDate), "MM/dd/yyyy")}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/status.png" alt="" width={14} height={14} />
                  <span className={statusColor}>{status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ASSIGNMENT DETAILS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Assignment Details</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-medium text-gray-700">Description</h3>
              <p className="text-sm text-gray-600 mt-1">
                {assignment.description || "No description provided."}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Instructions</h3>
              <p className="text-sm text-gray-600 mt-1">
                {assignment.instructions ||
                  "No specific instructions provided."}
              </p>
            </div>
            {assignment.totalPoints && (
              <div>
                <h3 className="font-medium text-gray-700">Total Points</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {assignment.totalPoints} points
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RESULTS SECTION - Only for teachers/admin */}
        {(role === "admin" || role === "teacher") &&
          assignment.results.length > 0 && (
            <div className="mt-4 bg-white rounded-md p-4">
              <h2 className="text-lg font-semibold mb-4">
                Student Submissions
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm border-b">
                      <th className="pb-2">Student</th>
                      <th className="pb-2">Score</th>
                      <th className="pb-2">Submitted At</th>
                      <th className="pb-2">Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignment.results.map((result) => (
                      <tr key={result.id} className="border-b border-gray-100">
                        <td className="py-3">
                          {result.student.name} {result.student.surname}
                        </td>
                        <td className="py-3">
                          {result.score !== null
                            ? `${result.score}/${assignment.totalPoints || 100}`
                            : "Not graded"}
                        </td>
                        <td className="py-3">
                          {result.submittedAt
                            ? format(new Date(result.submittedAt), "MM/dd/yyyy")
                            : "Not submitted"}
                        </td>
                        <td className="py-3">
                          {result.feedback || "No feedback"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
              href={`/list/lessons?classId=${assignment.lesson.class.id}`}
            >
              Class Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/teachers?classId=${assignment.lesson.class.id}`}
            >
              Class Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/exams?classId=${assignment.lesson.class.id}`}
            >
              Class Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/results?assignmentId=${assignment.id}`}
            >
              Assignment Results
            </Link>
          </div>
        </div>

        {/* STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Assignment Stats</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Submissions</span>
              <span className="font-semibold">{assignment.results.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Score</span>
              <span className="font-semibold">
                {assignment.results.length > 0
                  ? Math.round(
                      assignment.results.reduce(
                        (sum, result) => sum + (result.score || 0),
                        0
                      ) / assignment.results.length
                    )
                  : 0}
                /{assignment.totalPoints || 100}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`font-semibold ${statusColor}`}>{status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAssignmentPage;
