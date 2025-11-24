export const dynamic = "force-dynamic";

// app/parents/[id]/page.tsx
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Parent, Student } from "@prisma/client";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
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
  MapPin,
  Calendar,
  BookOpen,
  ArrowRight,
  Shield,
} from "lucide-react";

interface Grade {
  id: string;
  level: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ParentWithStudents extends Parent {
  students: (Student & {
    class?: {
      name: string;
      grade: Grade;
    };
  })[];
}

const SingleParentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const parent: ParentWithStudents | null = await prisma.parent.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          class: {
            select: {
              name: true,
              grade: true,
            },
          },
        },
      },
    },
  });

  if (!parent) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/parents"
                  className="hover:text-blue-600 transition-colors"
                >
                  Parents
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {parent.name} {parent.surname}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {parent.name} {parent.surname}
              </h1>
              <p className="text-gray-600 mt-2">
                Parent of {parent.students.length} student
                {parent.students.length !== 1 ? "s" : ""}
              </p>
            </div>

            {role === "admin" && (
              <div className="flex gap-3">
                <FormContainer table="parent" type="update" data={parent} />
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
            {/* Parent Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    {/* Use img field instead of image */}
                    {/* <AvatarImage src={parent.img || undefined} /> */}
                    <AvatarFallback className="bg-blue-500 text-white text-lg font-semibold">
                      {getInitials(parent.name, parent.surname)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {parent.name} {parent.surname}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0"
                      >
                        Parent
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Member since {formatDate(parent.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Contact Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span
                          className={
                            parent.email ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {parent.email || "No email provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span
                          className={
                            parent.phone ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {parent.phone || "No phone provided"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span
                          className={
                            parent.address ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {parent.address || "No address provided"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      Connected Students
                    </h3>
                    <div className="space-y-2">
                      {parent.students.length > 0 ? (
                        parent.students.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.name} {student.surname}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.class?.name || "No class"} • Grade{" "}
                                {student.class?.grade.level || "N/A"}
                              </p>
                            </div>
                            <Link href={`/students/${student.id}`}>
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
                          No students connected
                        </p>
                      )}
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
                      {parent.students.length}
                    </p>
                    <p className="text-sm text-gray-600">Total Students</p>
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
                      {new Set(parent.students.map((s) => s.classId)).size}
                    </p>
                    <p className="text-sm text-gray-600">Classes</p>
                  </div>
                </CardContent>
              </Card>

              {/* Add more stat cards as needed */}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:space-y-8">
            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/students?parentId=${parent.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View All Students
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href={`/messages?parentId=${parent.id}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Send Message
                    <Mail className="h-4 w-4" />
                  </Button>
                </Link>
                {role === "admin" && (
                  <Link href={`/reports/parent/${parent.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      View Reports
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity (Placeholder) */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates and interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 bg-blue-200 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Profile Updated
                      </p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 bg-green-200 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        New Student Connected
                      </p>
                      <p className="text-xs text-gray-500">1 week ago</p>
                    </div>
                  </div>
                  {/* Add more activity items */}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact (if applicable) */}
            {parent.phone && (
              <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-red-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-600">
                    <Phone className="h-4 w-4" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-gray-900">
                    {parent.phone}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Available 24/7</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleParentPage;
