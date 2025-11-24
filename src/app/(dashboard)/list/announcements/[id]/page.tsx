import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Class } from "@prisma/client";
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
  Users,
  ArrowRight,
  FileText,
  BarChart3,
  Megaphone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Bell,
  Target,
  Eye,
  CalendarDays,
} from "lucide-react";

export const dynamic = "force-dynamic";

type AnnouncementWithRelations = Announcement & {
  class?: Class | null;
};

const SingleAnnouncementPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const announcement: AnnouncementWithRelations | null =
    await prisma.announcement.findUnique({
      where: { id },
      include: {
        class: true,
      },
    });

  if (!announcement) {
    return notFound();
  }

  const now = new Date();
  const announcementDate = new Date(announcement.date);

  let status = "Current";
  let statusColor = "bg-green-100 text-green-800 border-green-200";
  let gradientColor = "from-green-600 to-green-700";
  let StatusIcon = CheckCircle;

  if (now < announcementDate) {
    status = "Upcoming";
    statusColor = "bg-blue-100 text-blue-800 border-blue-200";
    gradientColor = "from-blue-600 to-blue-700";
    StatusIcon = Clock;
  } else if (
    now.getTime() - announcementDate.getTime() >
    7 * 24 * 60 * 60 * 1000
  ) {
    status = "Archived";
    statusColor = "bg-gray-100 text-gray-800 border-gray-200";
    gradientColor = "from-gray-600 to-gray-700";
    StatusIcon = Eye;
  }

  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    normal: "bg-blue-100 text-blue-800 border-blue-200",
    low: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const priority = announcement.priority?.toLowerCase() || "normal";
  const PriorityIcon = priority === "high" ? AlertTriangle : Bell;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (title: string) => {
    return title
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const daysSinceAnnouncement = Math.ceil(
    (now.getTime() - announcementDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const getAnnouncementType = () => {
    if (announcement.class) return "Class-specific";
    return "School-wide";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/announcements"
                  className="hover:text-orange-600 transition-colors"
                >
                  Announcements
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {announcement.title}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {announcement.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {formatDate(announcementDate)} • {getAnnouncementType()} •{" "}
                {status}
              </p>
            </div>

            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-3">
                <FormContainer
                  table="announcement"
                  type="update"
                  data={announcement}
                />
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Edit Announcement
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Announcement Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader
                className={`bg-gradient-to-r ${gradientColor} text-white pb-6`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-white text-orange-600 text-lg font-semibold">
                      <Megaphone className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {announcement.title}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0 flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-orange-100">
                      {formatDate(announcementDate)} • {getAnnouncementType()} •{" "}
                      <span className="capitalize">{priority} Priority</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Announcement Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-600" />
                      Announcement Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CalendarDays className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Announcement Date
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(announcementDate)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <PriorityIcon className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Priority Level
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {priority}
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
                    </div>
                  </div>

                  {/* Audience Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      Audience Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Target Audience
                          </p>
                          <p className="text-sm text-gray-600">
                            {announcement.class?.name || "All Classes"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Announcement Type
                          </p>
                          <p className="text-sm text-gray-600">
                            {getAnnouncementType()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Created
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(announcement.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Announcement Description */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-600" />
                    Announcement Description
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 min-h-[150px]">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {announcement.description ||
                        "No detailed description provided."}
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <CalendarDays className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatDate(announcementDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Announcement Date
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {getAnnouncementType()}
                        </p>
                        <p className="text-sm text-gray-600">Audience Type</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Clock className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">
                          {daysSinceAnnouncement}
                        </p>
                        <p className="text-sm text-gray-600">Days Since</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
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
                {announcement.class && (
                  <Link
                    href={`/classes/${announcement.class.id}`}
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
                )}
                <Link
                  href={`/list/announcements?classId=${
                    announcement.classId || ""
                  }`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    More Announcements
                    <Megaphone className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/calendar" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View Calendar
                    <Calendar className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Back to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Announcement Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-orange-600" />
                  Announcement Status
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
                      Priority
                    </span>
                    <Badge
                      className={`${
                        priorityColors[
                          priority as keyof typeof priorityColors
                        ] || priorityColors.normal
                      } flex items-center gap-1`}
                    >
                      <PriorityIcon className="h-3 w-3" />
                      <span className="capitalize">{priority}</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Announcement Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(announcementDate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Days Since
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      {daysSinceAnnouncement} days
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audience Information */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-orange-600" />
                  Audience Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Target</span>
                    <span className="text-gray-600 font-semibold">
                      {announcement.class?.name || "All Classes"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {getAnnouncementType().toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Created</span>
                    <span className="text-gray-600">
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-600">
                      {formatDate(announcement.updatedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Announcement Quick Info */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-orange-600" />
                  Announcement Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Announcement ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {announcement.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Priority</span>
                    <Badge
                      variant="secondary"
                      className={`capitalize ${
                        priority === "high"
                          ? "text-red-600"
                          : priority === "medium"
                          ? "text-yellow-600"
                          : priority === "low"
                          ? "text-gray-600"
                          : "text-blue-600"
                      }`}
                    >
                      {priority}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="secondary" className="capitalize">
                      {status.toLowerCase()}
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

export default SingleAnnouncementPage;
