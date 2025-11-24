export const dynamic = "force-dynamic";

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
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  GraduationCap,
  BarChart3,
  UserCheck,
  School,
} from "lucide-react";

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

  const getInitials = (name: string, surname: string) => {
    return `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/lessons"
                  className="hover:text-blue-600 transition-colors"
                >
                  Lessons
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">{lesson.name}</span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {lesson.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {lesson.subject.name} • {lesson.class.name} •{" "}
                {formatTime(startTime)} - {formatTime(endTime)}
              </p>
            </div>

            {(role === "admin" || isTeacher) && (
              <div className="flex gap-3">
                <FormContainer table="lesson" type="update" data={lesson} />
                <Button variant="outline" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Attendance
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Lesson Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                      <BookOpen className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {lesson.name}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        {lesson.day}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      {lesson.subject.name} • {lesson.class.name} •{" "}
                      {lesson.teacher.name} {lesson.teacher.surname}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      Schedule Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Day</span>
                        <span className="font-semibold capitalize">
                          {lesson.day}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Time</span>
                        <span className="font-semibold">
                          {formatTime(startTime)} - {formatTime(endTime)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="font-semibold">
                          {duration} minutes
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <School className="h-4 w-4 text-blue-600" />
                      Class Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Subject</span>
                        <span className="font-semibold">
                          {lesson.subject.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Class</span>
                        <span className="font-semibold">
                          {lesson.class.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Students</span>
                        <span className="font-semibold">{totalStudents}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {lesson.description && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Lesson Description
                    </h4>
                    <p className="text-sm text-blue-700">
                      {lesson.description}
                    </p>
                  </div>
                )}
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
                      {presentStudents}
                    </p>
                    <p className="text-sm text-gray-600">Present Today</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-red-50 to-red-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Users className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {absentStudents}
                    </p>
                    <p className="text-sm text-gray-600">Absent Today</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {attendancePercentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Attendance Rate</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Section - For teachers and admin */}
            {(role === "admin" || isTeacher) && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    Today&apos;s Attendance
                  </CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {lesson.class.students.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {lesson.class.students.map((student) => {
                        const attendance = lesson.attendances.find(
                          (a) => a.studentId === student.id
                        );
                        return (
                          <div
                            key={student.id}
                            className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                              attendance
                                ? attendance.present
                                  ? "border-green-200 bg-green-50"
                                  : "border-red-200 bg-red-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs bg-purple-100 text-purple-600">
                                  {getInitials(student.name, student.surname)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-sm text-gray-900">
                                  {student.name} {student.surname}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                attendance
                                  ? attendance.present
                                    ? "default"
                                    : "destructive"
                                  : "outline"
                              }
                            >
                              {attendance
                                ? attendance.present
                                  ? "Present"
                                  : "Absent"
                                : "Not Marked"}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No students in this class</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/classes/${lesson.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Class Details
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/teachers/${lesson.teacher.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Teacher Profile
                    <GraduationCap className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/subjects/${lesson.subject.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Subject Details
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
                {(role === "admin" || isTeacher) && (
                  <Link
                    href={`/list/attendances?lessonId=${lesson.id}`}
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      View Attendance
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Teacher Information */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Teacher Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(lesson.teacher.name, lesson.teacher.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {lesson.teacher.name} {lesson.teacher.surname}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {lesson.teacher.email}
                    </p>
                    <p className="text-xs text-gray-400">Subject Teacher</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Statistics */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Lesson Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Class Size</span>
                  <span className="font-semibold">
                    {totalStudents} students
                  </span>
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
                  <span className="font-semibold">{formatTime(startTime)}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lesson ID</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {lesson.id.slice(0, 8)}...
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin/Teacher Actions */}
            {(role === "admin" || isTeacher) && (
              <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                    <School className="h-4 w-4" />
                    Lesson Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormContainer table="lesson" type="update" data={lesson} />
                  <Link
                    href={`/list/attendances?lessonId=${lesson.id}`}
                    className="block"
                  >
                    <Button className="w-full gap-2">
                      <UserCheck className="h-4 w-4" />
                      Take Attendance
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleLessonPage;
