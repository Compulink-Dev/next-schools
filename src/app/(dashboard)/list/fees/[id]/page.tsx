export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Fee, Class, Student } from "@prisma/client";
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
  DollarSign,
  Users,
  ArrowRight,
  FileText,
  BarChart3,
  GraduationCap,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type FeeWithRelations = Fee & {
  class?: Class | null;
  student?: Student | null;
};

const SingleFeePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const fee: FeeWithRelations | null = await prisma.fee.findUnique({
    where: { id },
    include: {
      class: true,
      student: true,
    },
  });

  if (!fee) {
    return notFound();
  }

  const now = new Date();
  const dueDate = new Date(fee.dueDate);

  let status = "Pending";
  let statusColor = "bg-yellow-100 text-yellow-800 border-yellow-200";
  let gradientColor = "from-yellow-600 to-yellow-700";
  let StatusIcon = Clock;

  if (fee.paid) {
    status = "Paid";
    statusColor = "bg-green-100 text-green-800 border-green-200";
    gradientColor = "from-green-600 to-green-700";
    StatusIcon = CheckCircle;
  } else if (now > dueDate) {
    status = "Overdue";
    statusColor = "bg-red-100 text-red-800 border-red-200";
    gradientColor = "from-red-600 to-red-700";
    StatusIcon = AlertTriangle;
  }

  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getInitials = (title: string) => {
    return title
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getFeeType = () => {
    if (fee.student) return "Individual";
    if (fee.class) return "Class-wide";
    return "School-wide";
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
                  href="/list/fees"
                  className="hover:text-amber-600 transition-colors"
                >
                  Fees
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">{fee.title}</span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {fee.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {formatCurrency(fee.amount)} •{" "}
                {fee.class?.name || "All Classes"} • {formatDate(dueDate)}
              </p>
            </div>

            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-3">
                <FormContainer table="fee" type="update" data={fee} />
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Edit Fee
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Fee Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader
                className={`bg-gradient-to-r ${gradientColor} text-white pb-6`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-white text-amber-600 text-lg font-semibold">
                      <DollarSign className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {fee.title}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0 flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-amber-100">
                      {formatCurrency(fee.amount)} • {getFeeType()} • Due{" "}
                      {formatDate(dueDate)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payment Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-600" />
                      Payment Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Amount
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(fee.amount)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Due Date
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(dueDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <StatusIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Status
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {status.toLowerCase()}
                          </p>
                        </div>
                      </div>
                      {!fee.paid && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Time Remaining
                            </p>
                            <p
                              className={`text-sm font-semibold ${
                                daysUntilDue < 0
                                  ? "text-red-600"
                                  : daysUntilDue <= 7
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {daysUntilDue < 0
                                ? `Overdue by ${Math.abs(daysUntilDue)} days`
                                : `${daysUntilDue} days`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audience Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-amber-600" />
                      Audience Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Class
                          </p>
                          <p className="text-sm text-gray-600">
                            {fee.class?.name || "All Classes"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Student
                          </p>
                          <p className="text-sm text-gray-600">
                            {fee.student
                              ? `${fee.student.name} ${fee.student.surname}`
                              : "All Students"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Fee Type
                          </p>
                          <p className="text-sm text-gray-600">
                            {getFeeType()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fee Description */}
                {fee.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-600" />
                      Fee Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {fee.description}
                    </p>
                  </div>
                )}

                {/* Payment Section - For students/parents */}
                {(role === "student" || role === "parent") && !fee.paid && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Make Payment
                        </h4>
                        <p className="text-sm text-yellow-700">
                          This fee is currently {status.toLowerCase()}. Please
                          make the payment before the due date.
                        </p>
                      </div>
                      <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                        <CreditCard className="h-4 w-4" />
                        Pay {formatCurrency(fee.amount)}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(fee.amount)}
                    </p>
                    <p className="text-sm text-gray-600">Amount Due</p>
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
                      {formatDate(dueDate)}
                    </p>
                    <p className="text-sm text-gray-600">Due Date</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getFeeType()}
                    </p>
                    <p className="text-sm text-gray-600">Fee Type</p>
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
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {fee.class && (
                  <Link href={`/classes/${fee.class.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      Class Details
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                {fee.student && (
                  <Link href={`/students/${fee.student.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      Student Profile
                      <Users className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link
                  href={`/list/fees?classId=${fee.classId || ""}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    More Fees
                    <DollarSign className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/financial" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Financial Overview
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Fee Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                  Fee Status
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
                      {status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Amount
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      {formatCurrency(fee.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Due Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(dueDate)}
                    </span>
                  </div>
                  {!fee.paid && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Time Remaining
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          daysUntilDue < 0
                            ? "text-red-600"
                            : daysUntilDue <= 7
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {daysUntilDue < 0 ? `Overdue` : `${daysUntilDue} days`}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details - If paid */}
            {fee.paid && (
              <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Payment Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-600">Payment Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        Paid
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                      <span className="text-gray-600">Paid Date</span>
                      <span className="text-gray-600">
                        {fee.updatedAt ? formatDate(fee.updatedAt) : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Payment Method</span>
                      <span className="text-gray-600">
                        {fee.paymentMethod || "Not specified"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fee Quick Info */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-amber-600" />
                  Fee Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Fee ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {fee.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-600">
                      {formatDate(fee.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Fee Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {getFeeType().toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleFeePage;
