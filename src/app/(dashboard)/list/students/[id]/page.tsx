export const dynamic = "force-dynamic";

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import StudentAttendanceCard from "@/components/StudentAttendanceCard";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Class, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
} from "lucide-react";

const SingleStudentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      class: { include: { _count: { select: { lessons: true } } } },
      parent: true,
      grade: true,
    },
  });

  if (!student) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/students"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Students
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {student.name} {student.surname}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {student.name} {student.surname}
              </h1>
              <p className="text-gray-600 mt-2">
                {student.class.name} • Grade {student.grade?.level || "N/A"}
              </p>
            </div>

            {role === "admin" && (
              <div className="flex gap-3">
                <FormContainer table="student" type="update" data={student} />
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
            {/* Student Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarImage src={student.img || undefined} />
                    <AvatarFallback className="bg-emerald-500 text-white text-lg font-semibold">
                      {getInitials(student.name, student.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {student.name} {student.surname}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        Student
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      {student.class.name} • Member since{" "}
                      {formatDate(student.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {student.email || "No email"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          {student.phone || "No phone"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Heart className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          Blood Type: {student.bloodType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">
                          Birthday: {formatDate(student.birthday)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-emerald-600" />
                      Academic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Class</span>
                        <span className="font-semibold">
                          {student.class.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Grade Level
                        </span>
                        <span className="font-semibold">
                          {student.grade?.level || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Total Lessons
                        </span>
                        <span className="font-semibold">
                          {student.class._count.lessons}
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
                    <Suspense
                      fallback={
                        <div className="h-8 bg-gray-200 rounded animate-pulse" />
                      }
                    >
                      <StudentAttendanceCard id={student.id} />
                    </Suspense>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {student.grade?.level || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">Grade Level</p>
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
                      {student.class._count.lessons}
                    </p>
                    <p className="text-sm text-gray-600">Lessons</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {student.class.name}
                    </p>
                    <p className="text-sm text-gray-600">Class</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Schedule */}
            <Card className="border-0 shadow-lg rounded-2xl h-[800px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Student&apos;s Schedule
                </CardTitle>
                <CardDescription>
                  Weekly class schedule and activities
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(800px-80px)]">
                <BigCalendarContainer type="classId" id={student.class.id} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/lessons?classId=${student.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Student&apos;s Lessons
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/teachers?classId=${student.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Student&apos;s Teachers
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/exams?classId=${student.class.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Student&apos;s Exams
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/results?studentId=${student.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Student&apos;s Results
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance */}
            <Performance />

            {/* Announcements */}
            <Announcements />

            {/* Parent Information */}
            {student.parent && (
              <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                    <Users className="h-4 w-4" />
                    Parent Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-semibold text-gray-900">
                      {student.parent.name} {student.parent.surname}
                    </p>
                    {student.parent.email && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {student.parent.email}
                      </p>
                    )}
                    {student.parent.phone && (
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        {student.parent.phone}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleStudentPage;
