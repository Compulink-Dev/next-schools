//@ts-nocheck
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
  Subject,
} from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
  Users,
  Mail,
  Calendar,
  BookOpen,
  ArrowRight,
  GraduationCap,
  BarChart3,
  FileText,
  Award,
  TrendingUp,
  Clock,
  Target,
} from "lucide-react";

type ResultWithRelations = Result & {
  student: Student;
  exam?:
    | (Exam & {
        lesson: {
          class: Class;
          teacher: Teacher;
          subject: Subject;
        };
      })
    | null;
  assignment?:
    | (Assignment & {
        lesson: {
          class: Class;
          teacher: Teacher;
          subject: Subject;
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
              subject: true,
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
              subject: true,
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
  let performanceBgColor = "";

  if (percentage >= 90) {
    grade = "A+";
    performance = "Excellent";
    performanceColor = "text-green-600";
    performanceBgColor = "bg-green-50 border-green-200";
  } else if (percentage >= 85) {
    grade = "A";
    performance = "Very Good";
    performanceColor = "text-green-600";
    performanceBgColor = "bg-green-50 border-green-200";
  } else if (percentage >= 80) {
    grade = "A-";
    performance = "Good";
    performanceColor = "text-green-500";
    performanceBgColor = "bg-green-50 border-green-200";
  } else if (percentage >= 75) {
    grade = "B+";
    performance = "Above Average";
    performanceColor = "text-blue-600";
    performanceBgColor = "bg-blue-50 border-blue-200";
  } else if (percentage >= 70) {
    grade = "B";
    performance = "Average";
    performanceColor = "text-blue-500";
    performanceBgColor = "bg-blue-50 border-blue-200";
  } else if (percentage >= 65) {
    grade = "B-";
    performance = "Satisfactory";
    performanceColor = "text-yellow-600";
    performanceBgColor = "bg-yellow-50 border-yellow-200";
  } else if (percentage >= 60) {
    grade = "C+";
    performance = "Below Average";
    performanceColor = "text-yellow-500";
    performanceBgColor = "bg-yellow-50 border-yellow-200";
  } else if (percentage >= 55) {
    grade = "C";
    performance = "Needs Improvement";
    performanceColor = "text-orange-500";
    performanceBgColor = "bg-orange-50 border-orange-200";
  } else if (percentage >= 50) {
    grade = "C-";
    performance = "Poor";
    performanceColor = "text-orange-600";
    performanceBgColor = "bg-orange-50 border-orange-200";
  } else if (percentage >= 45) {
    grade = "D+";
    performance = "Very Poor";
    performanceColor = "text-red-500";
    performanceBgColor = "bg-red-50 border-red-200";
  } else if (percentage >= 40) {
    grade = "D";
    performance = "Fail";
    performanceColor = "text-red-600";
    performanceBgColor = "bg-red-50 border-red-200";
  } else {
    grade = "F";
    performance = "Fail";
    performanceColor = "text-red-700";
    performanceBgColor = "bg-red-50 border-red-200";
  }

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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/results"
                  className="hover:text-purple-600 transition-colors"
                >
                  Results
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {assessment.title}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {assessment.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {isExam ? "Exam" : "Assignment"} result for{" "}
                {result.student.name} {result.student.surname}
              </p>
            </div>

            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-3">
                <FormContainer table="result" type="update" data={result} />
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Result Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-purple-500 text-white text-lg font-semibold">
                      {getInitials(result.student.name, result.student.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {result.student.name} {result.student.surname}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        {isExam ? "Exam Result" : "Assignment Result"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      {assessment.lesson.class.name} •{" "}
                      {assessment.lesson.subject.name} •{" "}
                      {assessment.lesson.teacher.name}{" "}
                      {assessment.lesson.teacher.surname}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance Summary */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Award className="h-4 w-4 text-purple-600" />
                      Performance Summary
                    </h3>
                    <div
                      className={`p-4 rounded-lg border ${performanceBgColor}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          Overall Grade
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {grade}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Performance
                        </span>
                        <span className={`font-semibold ${performanceColor}`}>
                          {performance}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor:
                              percentage >= 70
                                ? "#10b981"
                                : percentage >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Score</span>
                        <span className="font-semibold">
                          {result.score} / {maxScore}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Percentage
                        </span>
                        <span className="font-semibold">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Assessment Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      Assessment Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Target className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Type
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {isExam ? "Exam" : "Assignment"}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {isExam ? "Exam" : "Assignment"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Subject
                          </p>
                          <p className="text-sm text-gray-600">
                            {assessment.lesson.subject.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Date
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(
                              isExam
                                ? (assessment as any).startTime
                                : (assessment as any).startDate
                            )}
                          </p>
                        </div>
                      </div>
                      {result.submittedAt && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Submitted
                            </p>
                            <p className="text-sm text-gray-600">
                              {formatDateTime(result.submittedAt)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Teacher Feedback */}
                {result.feedback && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Teacher Feedback
                    </h4>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {result.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Score Percentage</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{grade}</p>
                    <p className="text-sm text-gray-600">Final Grade</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {result.score}/{maxScore}
                    </p>
                    <p className="text-sm text-gray-600">Raw Score</p>
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
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/students/${result.student.id}`} className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Student Profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {isExam ? (
                  <Link href={`/exams/${assessment.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      Exam Details
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href={`/assignments/${assessment.id}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      Assignment Details
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link
                  href={`/list/results?studentId=${result.student.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    All Results
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </Link>
                {(role === "admin" || role === "teacher") && (
                  <Link
                    href={`/list/results?classId=${assessment.lesson.class.id}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      Class Results
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Student Information */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      {getInitials(result.student.name, result.student.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {result.student.name} {result.student.surname}
                    </p>
                    <p className="text-sm text-gray-500">
                      {assessment.lesson.class.name}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Student ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {result.student.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Result ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {result.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Assessment Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {isExam ? "Exam" : "Assignment"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Grading Scale */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Grading Scale
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>A+ (90-100%)</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Excellent
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>A (85-89%)</span>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200"
                  >
                    Very Good
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>B+ (75-84%)</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-600 border-blue-200"
                  >
                    Above Average
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>B (70-74%)</span>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-500 border-blue-200"
                  >
                    Average
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>C (55-69%)</span>
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-600 border-yellow-200"
                  >
                    Needs Improvement
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span>D (40-54%)</span>
                  <Badge
                    variant="outline"
                    className="bg-orange-50 text-orange-600 border-orange-200"
                  >
                    Poor
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span>F (0-39%)</span>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-600 border-red-200"
                  >
                    Fail
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleResultPage;
