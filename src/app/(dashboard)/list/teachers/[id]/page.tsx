export const dynamic = "force-dynamic";

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Teacher } from "@prisma/client";
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
  Phone,
  Calendar,
  BookOpen,
  ArrowRight,
  GraduationCap,
  BarChart3,
  Clock,
  Heart,
  Bookmark,
  School,
} from "lucide-react";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!teacher) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/teachers"
                  className="hover:text-amber-600 transition-colors"
                >
                  Teachers
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {teacher.name} {teacher.surname}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {teacher.name} {teacher.surname}
              </h1>
              <p className="text-gray-600 mt-2">
                Teaching {teacher._count.subjects} subjects across{" "}
                {teacher._count.classes} classes
              </p>
            </div>

            {role === "admin" && (
              <div className="flex gap-3">
                <FormContainer table="teacher" type="update" data={teacher} />
                <Button variant="outline" className="gap-2">
                  <Mail className="h-4 w-4" />
                  Contact
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Teacher Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarImage src={teacher.img || undefined} />
                    <AvatarFallback className="bg-amber-500 text-white text-lg font-semibold">
                      {getInitials(teacher.name, teacher.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {teacher.name} {teacher.surname}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        Teacher
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-amber-100">
                      Member since {formatDate(teacher.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {teacher.email || "No email provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {teacher.phone || "No phone provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Heart className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          Blood Type: {teacher.bloodType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          Birthday: {formatDate(teacher.birthday)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-amber-600" />
                      Teaching Statistics
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Subjects</span>
                        <span className="font-semibold">
                          {teacher._count.subjects}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Lessons</span>
                        <span className="font-semibold">
                          {teacher._count.lessons}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Classes</span>
                        <span className="font-semibold">
                          {teacher._count.classes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">90%</p>
                    <p className="text-sm text-gray-600">Attendance</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Bookmark className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {teacher._count.subjects}
                    </p>
                    <p className="text-sm text-gray-600">Subjects</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {teacher._count.lessons}
                    </p>
                    <p className="text-sm text-gray-600">Lessons</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <School className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {teacher._count.classes}
                    </p>
                    <p className="text-sm text-gray-600">Classes</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule */}
            <Card className="border-0 shadow-lg rounded-2xl h-[800px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-600" />
                  Teacher&apos;s Schedule
                </CardTitle>
                <CardDescription>
                  Weekly teaching schedule and appointments
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(800px-80px)]">
                <BigCalendarContainer type="teacherId" id={teacher.id} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/classes?supervisorId=${teacher.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Teacher&apos;s Classes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/students?teacherId=${teacher.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Teacher&apos;s Students
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/lessons?teacherId=${teacher.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Teacher&apos;s Lessons
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/exams?teacherId=${teacher.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Teacher&apos;s Exams
                    <GraduationCap className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance */}
            <Performance />

            {/* Announcements */}
            <Announcements />

            {/* Teaching Summary */}
            <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-amber-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-600">
                  <School className="h-4 w-4" />
                  Teaching Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Active Subjects
                    </span>
                    <Badge variant="secondary">{teacher._count.subjects}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Weekly Lessons
                    </span>
                    <Badge variant="secondary">{teacher._count.lessons}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Assigned Classes
                    </span>
                    <Badge variant="secondary">{teacher._count.classes}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-gray-600">
                  <Clock className="h-4 w-4" />
                  Availability
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-900">
                    Currently Active
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Available for teaching and consultations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleTeacherPage;
