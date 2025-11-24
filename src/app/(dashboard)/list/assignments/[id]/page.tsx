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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  BookOpen,
  Users,
  ArrowRight,
  FileText,
  BarChart3,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  PlayCircle,
} from "lucide-react";

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
  let statusColor = "bg-green-100 text-green-800";
  let statusIcon = CheckCircle;

  if (now < startDate) {
    status = "Upcoming";
    statusColor = "bg-amber-100 text-amber-800";
    statusIcon = PlayCircle;
  } else if (now > dueDate) {
    status = "Overdue";
    statusColor = "bg-red-100 text-red-800";
    statusIcon = AlertCircle;
  }

  const StatusIcon = statusIcon;
  const submittedCount = assignment.results.filter((r) => r.submittedAt).length;
  const averageScore =
    assignment.results.length > 0
      ? Math.round(
          assignment.results.reduce(
            (sum, result) => sum + (result.score || 0),
            0
          ) / assignment.results.length
        )
      : 0;

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/assignments"
                  className="hover:text-amber-600 transition-colors"
                >
                  Assignments
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {assignment.title}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {assignment.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {assignment.lesson.subject.name} •{" "}
                {assignment.lesson.class.name}
              </p>
            </div>

            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-3">
                <FormContainer
                  table="assignment"
                  type="update"
                  data={assignment}
                />
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Edit Details
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Assignment Details Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20 bg-white">
                    <AvatarFallback className="bg-amber-500 text-white text-lg font-semibold">
                      <FileText className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {assignment.title}
                      <Badge
                        variant="secondary"
                        className={`${statusColor} border-0 flex items-center gap-1`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-amber-100">
                      {assignment.lesson.subject.name} assignment for{" "}
                      {assignment.lesson.class.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-amber-600" />
                      Assignment Schedule
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Start Date
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(assignment.startDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Due Date</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(assignment.dueDate)}
                          </p>
                        </div>
                      </div>
                      {assignment.totalPoints && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <BarChart3 className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">
                              Total Points
                            </p>
                            <p className="text-sm text-gray-600">
                              {assignment.totalPoints} points
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-600" />
                      Course Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Subject</p>
                          <p className="text-sm text-gray-600">
                            {assignment.lesson.subject.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Class</p>
                          <p className="text-sm text-gray-600">
                            {assignment.lesson.class.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Teacher</p>
                          <p className="text-sm text-gray-600">
                            {assignment.lesson.teacher.name}{" "}
                            {assignment.lesson.teacher.surname}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description and Instructions */}
                <div className="mt-6 space-y-6">
                  {assignment.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Description
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {assignment.description}
                      </p>
                    </div>
                  )}

                  {assignment.instructions && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Instructions
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {assignment.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student Submissions - Only for teachers/admin */}
            {(role === "admin" || role === "teacher") &&
              assignment.results.length > 0 && (
                <Card className="border-0 shadow-lg rounded-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-amber-600" />
                      Student Submissions ({submittedCount})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-500 text-sm border-b">
                            <th className="pb-3 font-semibold">Student</th>
                            <th className="pb-3 font-semibold">Score</th>
                            <th className="pb-3 font-semibold">Submitted At</th>
                            <th className="pb-3 font-semibold">Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignment.results.map((result) => (
                            <tr
                              key={result.id}
                              className="border-b border-gray-100 hover:bg-gray-50"
                            >
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-amber-100 text-amber-600">
                                      {getInitials(
                                        result.student.name,
                                        result.student.surname
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  {result.student.name} {result.student.surname}
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge
                                  variant={
                                    result.score !== null
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  {result.score !== null
                                    ? `${result.score}/${
                                        assignment.totalPoints || 100
                                      }`
                                    : "Not graded"}
                                </Badge>
                              </td>
                              <td className="py-3 text-sm text-gray-600">
                                {result.submittedAt
                                  ? format(
                                      new Date(result.submittedAt),
                                      "MMM dd, yyyy"
                                    )
                                  : "Not submitted"}
                              </td>
                              <td className="py-3 text-sm text-gray-600">
                                {result.feedback || "No feedback"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {submittedCount}
                    </p>
                    <p className="text-sm text-gray-600">Submissions</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {averageScore}
                    </p>
                    <p className="text-sm text-gray-600">Avg Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {assignment.totalPoints || 100}
                    </p>
                    <p className="text-sm text-gray-600">Total Points</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/results?assignmentId=${assignment.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View Results
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/lessons?classId=${assignment.lesson.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Class Lessons
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/teachers?classId=${assignment.lesson.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Class Teachers
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/exams?classId=${assignment.lesson.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Class Exams
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Assignment Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Assignment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <Badge className={`${statusColor} flex items-center gap-1`}>
                      <StatusIcon className="h-3 w-3" />
                      {status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Start Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(assignment.startDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Due Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(assignment.dueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Total Points
                    </span>
                    <span className="text-sm text-gray-600">
                      {assignment.totalPoints || 100}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Stats */}
            <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Submission Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Submitted</span>
                    <span className="font-semibold text-gray-900">
                      {submittedCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className="font-semibold text-gray-900">
                      {averageScore}/{assignment.totalPoints || 100}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          assignment.results.length > 0
                            ? (submittedCount / assignment.results.length) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {submittedCount} out of {assignment.results.length} students
                    submitted
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAssignmentPage;
