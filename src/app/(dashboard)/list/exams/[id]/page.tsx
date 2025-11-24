//@ts-nocheck
export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Class, Exam, Subject, Teacher } from "@prisma/client";
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
  Calendar,
  Clock,
  BookOpen,
  Users,
  ArrowRight,
  FileText,
  BarChart3,
  GraduationCap,
} from "lucide-react";

type ExamWithRelations = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const SingleExamPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const exam: ExamWithRelations | null = await prisma.exam.findUnique({
    where: { id },
    include: {
      lesson: {
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      },
    },
  });

  if (!exam) {
    return notFound();
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const isUpcoming = new Date(exam.startTime) > new Date();
  const isOngoing =
    new Date() >= new Date(exam.startTime) &&
    new Date() <= new Date(exam.endTime);
  const isCompleted = new Date() > new Date(exam.endTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/exams"
                  className="hover:text-blue-600 transition-colors"
                >
                  Exams
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">{exam.title}</span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {exam.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {exam.lesson.subject.name} • {exam.lesson.class.name}
              </p>
            </div>

            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-3">
                <FormContainer table="exam" type="update" data={exam} />
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
            {/* Exam Details Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20 bg-white">
                    <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                      <FileText className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {exam.title}
                      <Badge
                        variant="secondary"
                        className={
                          isUpcoming
                            ? "bg-yellow-500 text-white border-0"
                            : isOngoing
                            ? "bg-green-500 text-white border-0"
                            : "bg-gray-500 text-white border-0"
                        }
                      >
                        {isUpcoming
                          ? "Upcoming"
                          : isOngoing
                          ? "Ongoing"
                          : "Completed"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      {exam.lesson.subject.name} exam for{" "}
                      {exam.lesson.class.name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Exam Schedule
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Date</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(exam.startTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Time</p>
                          <p className="text-sm text-gray-600">
                            {formatTime(exam.startTime)} -{" "}
                            {formatTime(exam.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Duration</p>
                          <p className="text-sm text-gray-600">
                            {Math.round(
                              (new Date(exam.endTime).getTime() -
                                new Date(exam.startTime).getTime()) /
                                (1000 * 60)
                            )}{" "}
                            minutes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Course Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Subject</p>
                          <p className="text-sm text-gray-600">
                            {exam.lesson.subject.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Class</p>
                          <p className="text-sm text-gray-600">
                            {exam.lesson.class.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Teacher</p>
                          <p className="text-sm text-gray-600">
                            {exam.lesson.teacher.name}{" "}
                            {exam.lesson.teacher.surname}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {exam?.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Exam Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {exam?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-sm text-gray-600">Total Students</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-sm text-gray-600">Average Score</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                    <p className="text-sm text-gray-600">Results Submitted</p>
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
                  <FileText className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/results?examId=${exam.id}`}
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
                  href={`/list/lessons?classId=${exam.lesson.class.id}`}
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
                  href={`/list/assignments?classId=${exam.lesson.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Class Assignments
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
                {(role === "admin" || role === "teacher") && (
                  <Link href={`/exams/${exam.id}/edit`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      Manage Exam
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Exam Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Exam Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <Badge
                      className={
                        isUpcoming
                          ? "bg-yellow-100 text-yellow-800"
                          : isOngoing
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {isUpcoming
                        ? "Upcoming"
                        : isOngoing
                        ? "Ongoing"
                        : "Completed"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(exam.startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Time
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatTime(exam.startTime)} - {formatTime(exam.endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Duration
                    </span>
                    <span className="text-sm text-gray-600">
                      {Math.round(
                        (new Date(exam.endTime).getTime() -
                          new Date(exam.startTime).getTime()) /
                          (1000 * 60)
                      )}{" "}
                      min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                  Exam Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Bring your student ID</p>
                  <p>• Arrive 15 minutes early</p>
                  <p>• No electronic devices allowed</p>
                  <p>• Calculators permitted if specified</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleExamPage;
