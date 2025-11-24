export const dynamic = "force-dynamic";

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
  UserCheck,
  UserX,
  GraduationCap,
  FileText,
  BarChart3,
  TrendingUp,
} from "lucide-react";

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

  const StatusIcon = attendance.present ? UserCheck : UserX;
  const statusColor = attendance.present
    ? "bg-green-100 text-green-800 border-green-200"
    : "bg-red-100 text-red-800 border-red-200";
  const gradientColor = attendance.present
    ? "from-green-600 to-green-700"
    : "from-red-600 to-red-700";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/attendances"
                  className="hover:text-orange-600 transition-colors"
                >
                  Attendance
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {attendance.student.name} {attendance.student.surname}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {attendance.student.name} {attendance.student.surname}
              </h1>
              <p className="text-gray-600 mt-2">
                Attendance record for {attendance.lesson.subject.name} •{" "}
                {formatDate(attendance.date)}
              </p>
            </div>

            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-3">
                <FormContainer
                  table="attendance"
                  type="update"
                  data={attendance}
                />
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Edit Record
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Attendance Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader
                className={`bg-gradient-to-r ${gradientColor} text-white pb-6`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback
                      className={`text-white text-lg font-semibold ${
                        attendance.present ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      <StatusIcon className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {attendance.student.name} {attendance.student.surname}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0 flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {attendance.present ? "Present" : "Absent"}
                      </Badge>
                    </CardTitle>
                    <CardDescription
                      className={`${
                        attendance.present ? "text-green-100" : "text-red-100"
                      }`}
                    >
                      {attendance.lesson.subject.name} •{" "}
                      {attendance.lesson.class.name} •{" "}
                      {formatDate(attendance.date)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-orange-600" />
                      Student Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Full Name
                          </p>
                          <p className="text-sm text-gray-600">
                            {attendance.student.name}{" "}
                            {attendance.student.surname}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Class
                          </p>
                          <p className="text-sm text-gray-600">
                            {attendance.lesson.class.name}
                          </p>
                        </div>
                      </div>
                      {attendance.student.email && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Email
                            </p>
                            <p className="text-sm text-gray-600">
                              {attendance.student.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lesson Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-orange-600" />
                      Lesson Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Subject
                          </p>
                          <p className="text-sm text-gray-600">
                            {attendance.lesson.subject.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Teacher
                          </p>
                          <p className="text-sm text-gray-600">
                            {attendance.lesson.teacher.name}{" "}
                            {attendance.lesson.teacher.surname}
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
                            {formatDate(attendance.date)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Summary */}
                <div className={`mt-6 p-4 rounded-lg border ${statusColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className="h-5 w-5" />
                      <div>
                        <h4 className="font-semibold">Attendance Status</h4>
                        <p className="text-sm opacity-90">
                          Student was marked{" "}
                          {attendance.present ? "present" : "absent"} for this
                          lesson
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        attendance.present
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }
                    >
                      {attendance.present ? "Present" : "Absent"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {attendance.present ? "1" : "0"}
                    </p>
                    <p className="text-sm text-gray-600">Present Today</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDate(attendance.date)}
                    </p>
                    <p className="text-sm text-gray-600">Record Date</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {attendance.lesson.subject.name}
                    </p>
                    <p className="text-sm text-gray-600">Subject</p>
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
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/students/${attendance.student.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Student Profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/lessons?classId=${attendance.lesson.class.id}`}
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
                  href={`/list/attendances?studentId=${attendance.student.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Student's Attendance
                    <UserCheck className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/attendances?classId=${attendance.lesson.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Class Attendance
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Attendance Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Record Details
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
                      {attendance.present ? "Present" : "Absent"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(attendance.date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Subject
                    </span>
                    <span className="text-sm text-gray-600">
                      {attendance.lesson.subject.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Class
                    </span>
                    <span className="text-sm text-gray-600">
                      {attendance.lesson.class.name}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Student Quick Info */}
            <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-600">
                  <Users className="h-4 w-4" />
                  Student Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-orange-100 text-orange-600">
                      {getInitials(
                        attendance.student.name,
                        attendance.student.surname
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {attendance.student.name} {attendance.student.surname}
                    </p>
                    <p className="text-sm text-gray-500">
                      {attendance.lesson.class.name}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Student ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {attendance.student.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Record ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {attendance.id.slice(0, 8)}...
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Impact */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  Attendance Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        attendance.present ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    {attendance.present
                      ? "Student attended the lesson"
                      : "Student missed the lesson"}
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    Affects overall attendance rate
                  </p>
                  <p className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Recorded in academic history
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

export default SingleAttendancePage;
