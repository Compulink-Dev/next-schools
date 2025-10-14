import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  User,
  BookOpen,
  Award,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Users,
  Shield,
} from "lucide-react";

export default async function Profile() {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  let userDetails: any = null;
  let results: any[] = [];
  let stats: any = {};

  if (role === "student") {
    userDetails = await prisma.student.findUnique({
      where: { id: userId! },
      include: {
        class: true,
      },
    });
    results = await prisma.result.findMany({
      where: { studentId: userId! },
      include: {
        exam: true,
        assignment: true,
      },
      orderBy: { id: "desc" },
      take: 5,
    });

    // Calculate student stats
    const allResults = await prisma.result.findMany({
      where: { studentId: userId! },
    });
    stats = {
      averageScore:
        allResults.length > 0
          ? allResults.reduce((acc, curr) => acc + curr.score, 0) /
            allResults.length
          : 0,
      totalExams: allResults.filter((r) => r.examId).length,
      totalAssignments: allResults.filter((r) => r.assignmentId).length,
    };
  } else if (role === "teacher") {
    userDetails = await prisma.teacher.findUnique({
      where: { id: userId! },
      include: {
        subjects: true,
        classes: true,
      },
    });
  } else if (role === "parent") {
    userDetails = await prisma.parent.findUnique({
      where: { id: userId! },
      include: {
        students: {
          include: {
            class: true,
          },
        },
      },
    });
  } else if (role === "admin") {
    userDetails = await prisma.admin.findFirst();
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "student":
        return <GraduationCap className="h-6 w-6" />;
      case "teacher":
        return <User className="h-6 w-6" />;
      case "parent":
        return <Users className="h-6 w-6" />;
      case "admin":
        return <Shield className="h-6 w-6" />;
      default:
        return <User className="h-6 w-6" />;
    }
  };

  const formatFieldName = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const shouldDisplayField = (key: string) => {
    const hiddenFields = ["id", "createdAt", "updatedAt", "password"];
    return !hiddenFields.includes(key);
  };

  return (
    <div className="min-h-screen bg-gray-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and view your progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center space-x-4">
                  <div className="h-20 w-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    {getRoleIcon(role || "")}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      {userDetails?.name ||
                        userDetails?.firstName + " " + userDetails?.lastName}
                    </h2>
                    <p className="text-blue-100 capitalize">{role}</p>
                    {userDetails?.class && (
                      <p className="text-blue-100 text-sm mt-1">
                        Class {userDetails.class.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {userDetails?.email && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{userDetails.email}</span>
                    </div>
                  )}
                  {userDetails?.phone && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{userDetails.phone}</span>
                    </div>
                  )}
                  {userDetails?.address && (
                    <div className="flex items-center space-x-3 text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{userDetails.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Student Stats */}
              {role === "student" && (
                <div className="border-t border-gray-100 p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                    Performance Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Award className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.averageScore.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-600">Average</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <BookOpen className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalExams + stats.totalAssignments}
                      </p>
                      <p className="text-xs text-gray-600">Total Tests</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile Details
                </h2>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>

              {userDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(userDetails)
                    .filter(([key]) => shouldDisplayField(key))
                    .map(([key, value]) => (
                      <div key={key} className="group">
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {formatFieldName(key)}
                        </label>
                        <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors">
                          <span className="text-sm font-medium text-gray-900">
                            {String(value) || "Not provided"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No profile details available</p>
                </div>
              )}
            </div>

            {/* Student Results */}
            {role === "student" && results.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Results
                  </h2>
                  <BookOpen className="h-5 w-5 text-gray-400" />
                </div>

                <div className="space-y-4">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            result.score >= 80
                              ? "bg-green-100 text-green-600"
                              : result.score >= 60
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          <Award className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {result.exam?.title || result.assignment?.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {result.examId ? "Exam" : "Assignment"} •{" "}
                            {new Date(result.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-lg font-semibold ${
                            result.score >= 80
                              ? "text-green-600"
                              : result.score >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {result.score}%
                        </p>
                        <p className="text-xs text-gray-500">Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teacher Subjects */}
            {role === "teacher" &&
              userDetails?.subjects &&
              userDetails.subjects.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Teaching Subjects
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {userDetails.subjects.map((subject: any) => (
                      <span
                        key={subject.id}
                        className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {subject.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Parent's Children */}
            {role === "parent" &&
              userDetails?.students &&
              userDetails.students.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Children
                  </h2>
                  <div className="grid gap-4">
                    {userDetails.students.map((student: any) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Class {student.class?.name} • {student.rollNumber}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Student</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
