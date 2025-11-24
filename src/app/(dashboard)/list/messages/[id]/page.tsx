//@ts-nocheck
export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Message } from "@prisma/client";
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
  User,
  Users,
  ArrowRight,
  FileText,
  BarChart3,
  Mail,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  Reply,
  CornerUpLeft,
  MessageCircle,
} from "lucide-react";

type MessageWithDetails = Message;

const SingleMessagePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const message: MessageWithDetails | null = await prisma.message.findUnique({
    where: { id },
  });

  if (!message) {
    return notFound();
  }

  // Mark as read if current user is the receiver
  if (!message.read && message.receiverId === currentUserId) {
    await prisma.message.update({
      where: { id },
      data: { read: true },
    });
  }

  const isSender = message.senderId === currentUserId;
  const isReceiver = message.receiverId === currentUserId;

  const getStatusColor = () => {
    if (message.read) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const getGradientColor = () => {
    if (message.read) {
      return "from-green-600 to-green-700";
    }
    return "from-blue-600 to-blue-700";
  };

  const getStatusIcon = () => {
    return message.read ? Eye : EyeOff;
  };

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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getDirection = () => {
    if (isSender) return "Outgoing";
    if (isReceiver) return "Incoming";
    return "Admin View";
  };

  const StatusIcon = getStatusIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <Link
                  href="/list/messages"
                  className="hover:text-blue-600 transition-colors"
                >
                  Messages
                </Link>
                <span>/</span>
                <span className="text-gray-700 font-medium">
                  {message.title}
                </span>
              </nav>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {message.title}
              </h1>
              <p className="text-gray-600 mt-2">
                {getDirection()} • {formatDate(message.createdAt)} •
                {message.read ? " Read" : " Unread"}
              </p>
            </div>

            {(role === "admin" || isSender) && (
              <div className="flex gap-3">
                <FormContainer table="message" type="update" data={message} />
                <Button variant="outline" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Edit Message
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-6 lg:space-y-8">
            {/* Message Profile Card */}
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardHeader
                className={`bg-gradient-to-r ${getGradientColor()} text-white pb-6`}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-white/20">
                    <AvatarFallback className="bg-white text-blue-600 text-lg font-semibold">
                      <Mail className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {message.title}
                      <Badge
                        variant="secondary"
                        className="bg-white/20 text-white border-0 flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {message.read ? "Read" : "Unread"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      {getDirection()} • {formatDateTime(message.createdAt)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sender Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      From
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {getInitials(message.senderType)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Sender
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {message.senderType} • {message.senderId}
                            {isSender && (
                              <Badge variant="secondary" className="ml-2">
                                You
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Receiver Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      To
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-purple-100 text-purple-600">
                            {getInitials(message.receiverType)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Receiver
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {message.receiverType} • {message.receiverId}
                            {isReceiver && (
                              <Badge variant="secondary" className="ml-2">
                                You
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Message Content
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6 min-h-[200px]">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-lg">
                      {message.content}
                    </p>
                  </div>
                </div>

                {/* Reply Section - For receivers */}
                {isReceiver && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1 flex items-center gap-2">
                          <Reply className="h-4 w-4" />
                          Reply to Message
                        </h4>
                        <p className="text-sm text-blue-700">
                          Send a response to this message.
                        </p>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                        <Reply className="h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {message.content.length}
                    </p>
                    <p className="text-sm text-gray-600">Characters</p>
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
                      {formatDate(message.createdAt)}
                    </p>
                    <p className="text-sm text-gray-600">Sent Date</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getDirection()}
                    </p>
                    <p className="text-sm text-gray-600">Direction</p>
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
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link
                  href={`/list/messages?senderId=${message.senderId}`}
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    View All from Sender
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {isReceiver && (
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Reply to Message
                    <Reply className="h-4 w-4" />
                  </Button>
                )}
                <Link href="/list/messages" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    All Messages
                    <Mail className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/dashboard" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between h-12"
                  >
                    Back to Dashboard
                    <CornerUpLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Message Status */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  Message Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Status
                    </span>
                    <Badge
                      className={`${getStatusColor()} flex items-center gap-1`}
                    >
                      <StatusIcon className="h-3 w-3" />
                      {message.read ? "Read" : "Unread"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Direction
                    </span>
                    <span className="text-sm text-gray-600 font-semibold">
                      {getDirection()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Sent Date
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Last Updated
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(message.updatedAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Message Information */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Message Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Message ID</span>
                    <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {message.id.slice(0, 8)}...
                    </code>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Characters</span>
                    <span className="text-gray-600 font-semibold">
                      {message.content.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-gray-600">Sender Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {message.senderType.toLowerCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Receiver Type</span>
                    <Badge variant="secondary" className="capitalize">
                      {message.receiverType.toLowerCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Message Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Sent</p>
                      <p className="text-xs text-gray-600">
                        {formatDateTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                  {message.read && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Read
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(message.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {message.updatedAt !== message.createdAt && !message.read && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Updated
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDateTime(message.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleMessagePage;
