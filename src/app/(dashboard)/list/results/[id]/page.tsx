export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Result,
  Exam,
  Assignment,
  Student,
  Teacher,
  Class,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ResultWithRelations = Result & {
  student: Student;
  exam?:
    | (Exam & {
        lesson: {
          class: Class;
          teacher: Teacher;
        };
      })
    | null;
  assignment?:
    | (Assignment & {
        lesson: {
          class: Class;
          teacher: Teacher;
        };
      })
    | null;
};

const SingleResultPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const result: ResultWithRelations | null = await prisma.result.findUnique({
    where: { id },
    include: {
      student: true,
      exam: {
        include: {
          lesson: {
            include: {
              class: true,
              teacher: true,
            },
          },
        },
      },
      assignment: {
        include: {
          lesson: {
            include: {
              class: true,
              teacher: true,
            },
          },
        },
      },
    },
  });

  if (!result) {
    return notFound();
  }

  const assessment = result.exam || result.assignment;
  if (!assessment) {
    return notFound();
  }

  const isExam = "startTime" in assessment;
  const maxScore = isExam ? 100 : (assessment as any).totalPoints || 100;
  const percentage = (result.score / maxScore) * 100;

  // Calculate grade and performance
  let grade = "";
  let performance = "";
  let performanceColor = "";

  if (percentage >= 90) {
    grade = "A+";
    performance = "Excellent";
    performanceColor = "text-green-600";
  } else if (percentage >= 85) {
    grade = "A";
    performance = "Very Good";
    performanceColor = "text-green-600";
  } else if (percentage >= 80) {
    grade = "A-";
    performance = "Good";
    performanceColor = "text-green-500";
  } else if (percentage >= 75) {
    grade = "B+";
    performance = "Above Average";
    performanceColor = "text-blue-600";
  } else if (percentage >= 70) {
    grade = "B";
    performance = "Average";
    performanceColor = "text-blue-500";
  } else if (percentage >= 65) {
    grade = "B-";
    performance = "Satisfactory";
    performanceColor = "text-yellow-600";
  } else if (percentage >= 60) {
    grade = "C+";
    performance = "Below Average";
    performanceColor = "text-yellow-500";
  } else if (percentage >= 55) {
    grade = "C";
    performance = "Needs Improvement";
    performanceColor = "text-orange-500";
  } else if (percentage >= 50) {
    grade = "C-";
    performance = "Poor";
    performanceColor = "text-orange-600";
  } else if (percentage >= 45) {
    grade = "D+";
    performance = "Very Poor";
    performanceColor = "text-red-500";
  } else if (percentage >= 40) {
    grade = "D";
    performance = "Fail";
    performanceColor = "text-red-600";
  } else {
    grade = "F";
    performance = "Fail";
    performanceColor = "text-red-700";
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* RESULT INFO CARD */}
          <div className="bg-white py-6 px-4 rounded-md flex-1 flex gap-4 border shadow-sm">
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-lamaSky flex items-center justify-center">
                <Image
                  src={isExam ? "/exam.png" : "/assignment.png"}
                  alt={isExam ? "Exam" : "Assignment"}
                  width={64}
                  height={64}
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{assessment.title}</h1>
                {(role === "admin" || role === "teacher") && (
                  <FormContainer table="result" type="update" data={result} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {isExam ? "Exam" : "Assignment"} result for{" "}
                {result.student.name} {result.student.surname}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/score.png" alt="" width={14} height={14} />
                  <span className="font-bold text-lg">
                    {result.score} / {maxScore}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/percentage.png" alt="" width={14} height={14} />
                  <span className="font-semibold">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/grade.png" alt="" width={14} height={14} />
                  <span className="font-semibold text-lg">{grade}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/student.png" alt="" width={14} height={14} />
                  <span>
                    {result.student.name} {result.student.surname}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{assessment.lesson.class.name}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/teacher.png" alt="" width={14} height={14} />
                  <span>
                    {assessment.lesson.teacher.name}{" "}
                    {assessment.lesson.teacher.surname}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RESULT DETAILS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Result Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Performance Summary
              </h3>
              <p className="text-sm text-gray-600">
                {result.student.name} scored {result.score} out of {maxScore}{" "}
                points ({percentage.toFixed(1)}%) on this{" "}
                {isExam ? "exam" : "assignment"}, achieving a grade of{" "}
                <span className="font-semibold">{grade}</span> which is
                considered{" "}
                <span className={`font-semibold ${performanceColor}`}>
                  {performance}
                </span>
                .
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Assessment Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Type:</strong> {isExam ? "Exam" : "Assignment"}
                  </p>
                  <p>
                    <strong>Title:</strong> {assessment.title}
                  </p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(
                      isExam
                        ? (assessment as any).startTime
                        : (assessment as any).startDate
                    )}
                  </p>
                  <p>
                    <strong>Max Score:</strong> {maxScore}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Student Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Name:</strong> {result.student.name}{" "}
                    {result.student.surname}
                  </p>
                  <p>
                    <strong>Class:</strong> {assessment.lesson.class.name}
                  </p>
                  <p>
                    <strong>Teacher:</strong> {assessment.lesson.teacher.name}{" "}
                    {assessment.lesson.teacher.surname}
                  </p>
                  <p>
                    <strong>Submitted:</strong>{" "}
                    {result.createdAt
                      ? new Intl.DateTimeFormat("en-US").format(
                          result.createdAt
                        )
                      : "Not submitted"}
                  </p>
                </div>
              </div>
            </div>
            {result.feedback && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Teacher Feedback
                </h3>
                <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
                  {result.feedback}
                </p>
              </div>
            )}
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
              href={`/list/students/${result.student.id}`}
            >
              Student Profile
            </Link>
            {isExam ? (
              <Link
                className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
                href={`/list/exams/${assessment.id}`}
              >
                Exam Details
              </Link>
            ) : (
              <Link
                className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
                href={`/list/assignments/${assessment.id}`}
              >
                Assignment Details
              </Link>
            )}
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/results?studentId=${result.student.id}`}
            >
              Student's All Results
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href={`/list/results?classId=${assessment.lesson.class.id}`}
            >
              Class Results
            </Link>
          </div>
        </div>

        {/* PERFORMANCE STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Performance Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Score</span>
              <span className="font-semibold">
                {result.score} / {maxScore}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Percentage</span>
              <span className="font-semibold">{percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Grade</span>
              <span className="font-semibold text-lg">{grade}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Performance</span>
              <span className={`font-semibold ${performanceColor}`}>
                {performance}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Assessment Type</span>
              <span className="font-semibold capitalize">
                {isExam ? "Exam" : "Assignment"}
              </span>
            </div>
          </div>
        </div>

        {/* GRADE DISTRIBUTION INFO */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Grading Scale</h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span>A+ (90-100%)</span>
              <span className="text-green-600">Excellent</span>
            </div>
            <div className="flex justify-between">
              <span>A (85-89%)</span>
              <span className="text-green-500">Very Good</span>
            </div>
            <div className="flex justify-between">
              <span>B+ (75-84%)</span>
              <span className="text-blue-600">Above Average</span>
            </div>
            <div className="flex justify-between">
              <span>B (70-74%)</span>
              <span className="text-blue-500">Average</span>
            </div>
            <div className="flex justify-between">
              <span>C (55-69%)</span>
              <span className="text-yellow-600">Needs Improvement</span>
            </div>
            <div className="flex justify-between">
              <span>D (40-54%)</span>
              <span className="text-orange-600">Poor</span>
            </div>
            <div className="flex justify-between">
              <span>F (0-39%)</span>
              <span className="text-red-600">Fail</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleResultPage;
