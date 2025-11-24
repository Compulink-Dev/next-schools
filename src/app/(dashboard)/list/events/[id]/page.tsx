export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Event, Class } from "@prisma/client";
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
  Users,
  ArrowRight,
  FileText,
  MapPin,
  Bell,
  BarChart3,
  GraduationCap,
  Sparkles,
} from "lucide-react";

type EventWithRelations = Event & {
  class?: Class | null;
};

const SingleEventPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const event: EventWithRelations | null = await prisma.event.findUnique({
    where: { id },
    include: {
      class: true,
    },
  });

  if (!event) {
    return notFound();
  }

  const now = new Date();
  const startTime = event.startTime ? new Date(event.startTime) : new Date();
  const endTime = event.endTime ? new Date(event.endTime) : new Date();

  let status = "Ongoing";
  let statusColor = "bg-green-100 text-green-800 border-green-200";
  let gradientColor = "from-green-600 to-green-700";
  let StatusIcon = Bell;

  if (now < startTime) {
    status = "Upcoming";
    statusColor = "bg-blue-100 text-blue-800 border-blue-200";
    gradientColor = "from-blue-600 to-blue-700";
    StatusIcon = Calendar;
  } else if (now > endTime) {
    status = "Completed";
    statusColor = "bg-gray-100 text-gray-800 border-gray-200";
    gradientColor = "from-gray-600 to-gray-700";
    StatusIcon = Sparkles;
  }

  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  ); // in hours

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

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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
                  href="/list/events"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Events
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">{event.title}</span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {event.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {event.class?.name || "All Classes"} • {formatDate(startTime)}
              </p>
            </div>

            {(role === "admin" || role === "teacher") && (
              <div className="flex gap-3">
                <FormContainer table="event" type="update" data={event} />
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Edit Event
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Event Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader
                className={`bg-gradient-to-r ${gradientColor} text-white pb-6`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-white text-indigo-600 text-lg font-semibold">
                      <Calendar className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {event.title}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0 flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-indigo-100">
                      {event.class?.name || "All Classes"} •{" "}
                      {formatDateTime(startTime)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Schedule */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-600" />
                      Event Schedule
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Start Time
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(startTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            End Time
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDateTime(endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Duration
                          </p>
                          <p className="text-sm text-gray-600">
                            {duration} hour{duration !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-indigo-600" />
                      Event Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Audience
                          </p>
                          <p className="text-sm text-gray-600">
                            {event.class?.name || "All Classes"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Location
                          </p>
                          <p className="text-sm text-gray-600">
                            {
                              //@ts-expect-error avaoid the location possibly
                              event.location || "Not specified"
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Bell className="h-4 w-4 text-gray-400" />
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
                </div>

                {/* Event Description */}
                {event.description && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      Event Description
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {duration}h
                    </p>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatDate(startTime)}
                    </p>
                    <p className="text-sm text-gray-600">Event Date</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {event.class?.name ? "Class" : "All"}
                    </p>
                    <p className="text-sm text-gray-600">Audience</p>
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
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.class && (
                  <Link href={`/classes/${event.class.id}`} className="block">
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
                  href={`/list/events?classId=${event.classId || ""}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    More Events
                    <Calendar className="h-4 w-4" />
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
                {(role === "admin" || role === "teacher") && (
                  <Link href={`/events/${event.id}/edit`} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between h-12"
                    >
                      Manage Event
                      <FileText className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Event Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-indigo-600" />
                  Event Status
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
                      Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(startTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Time
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatTime(startTime)} - {formatTime(endTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Duration
                    </span>
                    <span className="text-sm text-gray-600">
                      {duration} hour{duration !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Quick Info */}
            <Card className="border-0 shadow-lg rounded-2xl border-l-4 border-l-indigo-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-indigo-600">
                  <Sparkles className="h-4 w-4" />
                  Event Quick Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Event ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {event.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Created</span>
                    <span className="text-sm text-gray-600">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Audience</span>
                    <Badge variant="secondary">
                      {event.class?.name || "All Classes"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calendar Preview */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Calendar Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 p-2 bg-indigo-50 rounded-lg">
                    <div
                      className={`w-2 h-8 rounded-full ${
                        status === "Upcoming"
                          ? "bg-blue-500"
                          : status === "Ongoing"
                          ? "bg-green-500"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{event.title}</p>
                      <p className="text-gray-600">
                        {formatTime(startTime)} - {formatTime(endTime)}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-500 text-center">
                    View full calendar for more events
                  </p>
                  <Link
                    href="/calendar"
                    className="block text-center text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Open Calendar →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleEventPage;
