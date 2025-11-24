export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  Subject,
  Teacher,
  TeacherSubject,
  Class,
  Lesson,
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
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  ArrowRight,
  FileText,
  BarChart3,
} from "lucide-react";

type SubjectWithRelations = Subject & {
  teachers: (TeacherSubject & {
    teacher: Teacher;
  })[];
  lessons: (Lesson & {
    class: Class;
    teacher: Teacher;
  })[];
};

const SingleSubjectPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: {
      teachers: { include: { teacher: true } },
      lessons: {
        include: { class: true, teacher: true },
        orderBy: { day: "asc" },
      },
    },
  });

  if (!subject) {
    return notFound();
  }

  // Calculate subject statistics
  const totalTeachers = subject.teachers.length;
  const totalLessons = subject.lessons.length;
  const totalClasses = new Set(subject.lessons.map((lesson) => lesson.classId))
    .size;

  // Group lessons by class for better organization
  const lessonsByClass = subject.lessons.reduce((acc, lesson) => {
    if (!acc[lesson.classId]) {
      acc[lesson.classId] = {
        class: lesson.class,
        lessons: [],
      };
    }
    acc[lesson.classId].lessons.push(lesson);
    return acc;
  }, {} as Record<string, { class: Class; lessons: (Lesson & { teacher: Teacher })[] }>);

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/subjects"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Subjects
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {subject.name}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {subject.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {subject.description ||
                  "Comprehensive subject overview and management"}
              </p>
            </div>

            {role === "admin" && (
              <div className="flex gap-3">
                <FormContainer table="subject" type="update" data={subject} />
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Subject Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-indigo-500 text-white text-lg font-semibold">
                      {getInitials(subject.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {subject.name}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        Subject
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-indigo-100">
                      {totalLessons} lessons across {totalClasses} classes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-indigo-600" />
                      Subject Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <BookOpen className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{subject.name}</span>
                      </div>
                      {subject.description && (
                        <div className="flex items-start gap-3 text-gray-700">
                          <FileText className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-900">
                            {subject.description}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      Teaching Staff
                    </h3>
                    <div className="space-y-2">
                      {subject.teachers.length > 0 ? (
                        subject.teachers.map((teacherSub) => (
                          <div
                            key={teacherSub.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-purple-100 text-purple-600 text-xs">
                                  {getInitials(teacherSub.teacher.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {teacherSub.teacher.name}{" "}
                                  {teacherSub.teacher.surname}
                                </p>
                              </div>
                            </div>
                            <Link href={`/teachers/${teacherSub.teacher.id}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1"
                              >
                                View
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No teachers assigned
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {totalTeachers}
                    </p>
                    <p className="text-sm text-gray-600">Teachers</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalLessons}
                    </p>
                    <p className="text-sm text-gray-600">Lessons</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalClasses}
                    </p>
                    <p className="text-sm text-gray-600">Classes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lessons Schedule */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                  Lesson Schedule
                </CardTitle>
                <CardDescription>
                  All scheduled lessons for this subject
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subject.lessons.length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(lessonsByClass).map(
                      ([classId, classData]) => (
                        <div
                          key={classId}
                          className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b">
                            <h3 className="font-semibold text-gray-700">
                              {classData.class.name} Class
                            </h3>
                          </div>
                          <div className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {classData.lessons.map((lesson) => (
                                <div
                                  key={lesson.id}
                                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <Badge
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {lesson.day}
                                    </Badge>
                                    <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
                                      {lesson.name}
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                        {formatTime(lesson.startTime)} -{" "}
                                        {formatTime(lesson.endTime)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <Users className="h-4 w-4" />
                                      <span>
                                        {lesson.teacher.name}{" "}
                                        {lesson.teacher.surname}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No lessons scheduled</p>
                    <p className="text-sm mt-1">
                      Lessons will appear here when scheduled
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/lessons?search=${encodeURIComponent(
                    subject.name
                  )}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View All Lessons
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/teachers?subject=${encodeURIComponent(
                    subject.name
                  )}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View Teachers
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/exams?search=${encodeURIComponent(
                    subject.name
                  )}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View Exams
                    <FileText className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Subject Statistics */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Subject Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Teachers</span>
                  <span className="font-semibold">{totalTeachers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Lessons</span>
                  <span className="font-semibold">{totalLessons}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Classes</span>
                  <span className="font-semibold">{totalClasses}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subject ID</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {subject.id.slice(0, 8)}...
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subject Description */}
            {subject.description && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {subject.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Admin Actions */}
            {role === "admin" && (
              <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-indigo-500">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 text-indigo-600">
                    <Users className="h-4 w-4" />
                    Manage Subject
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormContainer table="subject" type="update" data={subject} />
                  <Link
                    href={`/list/lessons?subjectId=${subject.id}`}
                    className="block"
                  >
                    <Button className="w-full gap-2">
                      <Calendar className="h-4 w-4" />
                      Schedule Lesson
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

export default SingleSubjectPage;
