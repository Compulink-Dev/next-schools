export const dynamic = "force-dynamic";

// app/list/grades/[id]/page.tsx
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Grade, Class, Student, Teacher } from "@prisma/client";
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
  GraduationCap,
  BookOpen,
  ArrowRight,
  BarChart3,
  School,
  UserCheck,
  TrendingUp,
  Building,
} from "lucide-react";

type GradeWithRelations = Grade & {
  classes: (Class & {
    supervisor?: Teacher | null;
    _count: {
      students: number;
      lessons: number;
    };
  })[];
  students: (Student & {
    class?: Class | null;
    parent?: { name: string; surname: string } | null;
  })[];
  _count: {
    students: number;
    classes: number;
  };
};

const SingleGradePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const grade: GradeWithRelations | null = await prisma.grade.findUnique({
    where: { id },
    include: {
      classes: {
        include: {
          supervisor: true,
          _count: {
            select: {
              students: true,
              lessons: true,
            },
          },
        },
        orderBy: {
          name: "asc",
        },
      },
      students: {
        include: {
          class: true,
          parent: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      _count: {
        select: {
          students: true,
          classes: true,
        },
      },
    },
  });

  if (!grade) {
    return notFound();
  }

  // Calculate grade statistics
  const studentCount = grade._count.students;
  const classCount = grade._count.classes;
  const totalCapacity = grade.classes.reduce(
    (sum, classItem) => sum + classItem.capacity,
    0
  );
  const occupancyRate =
    totalCapacity > 0 ? (studentCount / totalCapacity) * 100 : 0;

  // Get unique teachers in this grade
  const teachers = Array.from(
    new Set(
      grade.classes
        .map((classItem) => classItem.supervisor)
        .filter(Boolean)
        .map((teacher) => `${teacher!.name} ${teacher!.surname}`)
    )
  );

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return "text-red-600 bg-red-50 border-red-200";
    if (rate >= 75) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getOccupancyStatus = (rate: number) => {
    if (rate >= 90) return "Nearly Full";
    if (rate >= 75) return "Good Occupancy";
    return "Available Seats";
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
                  href="/list/grades"
                  className="hover:text-emerald-600 transition-colors"
                >
                  Grades
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  Grade {grade.level}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                Grade {grade.level}
              </h1>
              <p className="text-gray-600 mt-2">
                {studentCount} students across {classCount} classes
              </p>
            </div>

            {role === "admin" && (
              <div className="flex gap-3">
                <FormContainer table="grade" type="update" data={grade} />
                <Button variant="outline" className="gap-2">
                  <Building className="h-4 w-4" />
                  Manage
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Grade Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-emerald-500 text-white text-lg font-semibold">
                      {grade.level}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      Grade {grade.level}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        Academic Level
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-emerald-100">
                      {grade.description ||
                        "Comprehensive grade overview and management"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <School className="h-4 w-4 text-emerald-600" />
                      Grade Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Grade Level
                        </span>
                        <span className="font-semibold">{grade.level}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Classes</span>
                        <span className="font-semibold">{classCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">Teachers</span>
                        <span className="font-semibold">{teachers.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-emerald-600" />
                      Student Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Total Students
                        </span>
                        <span className="font-semibold">{studentCount}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600">
                          Total Capacity
                        </span>
                        <span className="font-semibold">{totalCapacity}</span>
                      </div>
                      <div
                        className={`flex justify-between items-center p-3 rounded-lg border ${getOccupancyColor(
                          occupancyRate
                        )}`}
                      >
                        <span className="text-sm font-medium">
                          Occupancy Rate
                        </span>
                        <span className="font-semibold">
                          {occupancyRate.toFixed(1)}%
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
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {studentCount}
                    </p>
                    <p className="text-sm text-gray-600">Students</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <School className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {classCount}
                    </p>
                    <p className="text-sm text-gray-600">Classes</p>
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
                      {teachers.length}
                    </p>
                    <p className="text-sm text-gray-600">Teachers</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {occupancyRate.toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-600">Occupancy</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Classes Section */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-emerald-600" />
                  Classes ({classCount})
                </CardTitle>
                <CardDescription>
                  All classes in Grade {grade.level}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {grade.classes.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grade.classes.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-green-100 text-green-600">
                              {getInitials(classItem.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {classItem.name}
                            </h3>
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>
                                {classItem._count.students} /{" "}
                                {classItem.capacity} students
                              </p>
                              <p>{classItem._count.lessons} lessons</p>
                              {classItem.supervisor && (
                                <p>Supervisor: {classItem.supervisor.name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link href={`/list/classes/${classItem.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            View
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <School className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No classes in this grade</p>
                    {role === "admin" && (
                      <p className="text-sm mt-1">
                        Create classes to organize students
                      </p>
                    )}
                  </div>
                )}
                {grade.classes.length > 0 && (
                  <div className="text-center mt-4">
                    <Link
                      href={`/list/classes?gradeId=${grade.id}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center justify-center gap-1"
                    >
                      View all classes
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students Section */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-emerald-600" />
                  Students ({studentCount})
                </CardTitle>
                <CardDescription>
                  Students enrolled in Grade {grade.level}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {grade.students.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {grade.students.slice(0, 6).map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 bg-white"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-sm text-gray-900">
                              {student.name} {student.surname}
                            </h3>
                            <div className="text-xs text-gray-500">
                              {student.class && (
                                <p>Class: {student.class.name}</p>
                              )}
                              {student.parent && (
                                <p>Parent: {student.parent.name}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <Link href={`/list/students/${student.id}`}>
                          <Button variant="ghost" size="sm" className="gap-1">
                            View
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No students in this grade</p>
                  </div>
                )}
                {grade.students.length > 6 && (
                  <div className="text-center mt-4">
                    <Link
                      href={`/list/students?gradeId=${grade.id}`}
                      className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center justify-center gap-1"
                    >
                      View all {grade.students.length} students
                      <ArrowRight className="h-4 w-4" />
                    </Link>
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
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/classes?gradeId=${grade.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View All Classes
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/students?gradeId=${grade.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View All Students
                    <Users className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/teachers?gradeId=${grade.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View Teachers
                    <GraduationCap className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/list/lessons?gradeId=${grade.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View Lessons
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Grade Statistics */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-emerald-600" />
                  Grade Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Students</span>
                  <span className="font-semibold">{studentCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Classes</span>
                  <span className="font-semibold">{classCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Capacity</span>
                  <span className="font-semibold">{totalCapacity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Occupancy Rate</span>
                  <span className="font-semibold">
                    {occupancyRate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Teachers</span>
                  <span className="font-semibold">{teachers.length}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Grade ID</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {grade.id.slice(0, 8)}...
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teachers in Grade */}
            {teachers.length > 0 && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-emerald-600" />
                    Teachers ({teachers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {teachers.slice(0, 5).map((teacher, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {getInitials(teacher)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-gray-900">
                        {teacher}
                      </span>
                    </div>
                  ))}
                  {teachers.length > 5 && (
                    <div className="text-center pt-2">
                      <Link
                        href={`/list/teachers?gradeId=${grade.id}`}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                      >
                        View all {teachers.length} teachers
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Grade Description */}
            {grade.description && (
              <Card className="border-0 shadow-lg rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {grade.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Admin Actions */}
            {role === "admin" && (
              <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-emerald-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-emerald-600">
                    <Building className="h-4 w-4" />
                    Manage Grade
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <FormContainer table="grade" type="update" data={grade} />
                  <Link
                    href={`/list/classes?gradeId=${grade.id}`}
                    className="block"
                  >
                    <Button className="w-full gap-2">
                      <School className="h-4 w-4" />
                      Create New Class
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

export default SingleGradePage;
