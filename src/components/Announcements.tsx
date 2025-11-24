import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, ArrowRight, Megaphone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const Announcements = async () => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
    include: {
      class: {
        select: {
          name: true,
        },
      },
    },
  });

  const getPriorityColor = (index: number) => {
    const colors = [
      "from-blue-500 to-blue-600", // High priority - first item
      "from-green-500 to-green-600", // Medium priority - second item
      "from-orange-500 to-orange-600", // Low priority - third item
    ];
    return colors[index] || colors[2];
  };

  const getIcon = (index: number) => {
    const icons = ["🚨", "📢", "ℹ️"];
    return icons[index] || "📢";
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const announcementDate = new Date(date);
    const diffTime = Math.abs(now.getTime() - announcementDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;

    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(announcementDate);
  };

  const isRecent = (date: Date) => {
    const announcementDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - announcementDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays < 2; // Within last 2 days
  };

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-600 mb-2">No Announcements</h3>
            <p className="text-sm text-gray-500 mb-4">
              There are no announcements to display at the moment.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/list/announcements">
                Check All Announcements
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Latest Announcements
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <Link
              href="/list/announcements"
              className="flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((announcement, index) => (
          <div
            key={announcement.id}
            className={cn(
              "group relative p-4 rounded-xl border border-gray-100 transition-all duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer",
              "bg-gradient-to-r hover:bg-gradient-to-br",
              index === 0
                ? "hover:from-blue-50 hover:to-blue-100/50"
                : index === 1
                ? "hover:from-green-50 hover:to-green-100/50"
                : "hover:from-orange-50 hover:to-orange-100/50"
            )}
          >
            {/* Priority Indicator */}
            <div
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-r-full bg-gradient-to-b",
                getPriorityColor(index)
              )}
            />

            {/* New Badge */}
            {isRecent(announcement.date) && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1"
              >
                New
              </Badge>
            )}

            <div className="flex items-start gap-3 ml-2">
              {/* Icon */}
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold",
                  "bg-gradient-to-br",
                  getPriorityColor(index)
                )}
              >
                {getIcon(index)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 group-hover:text-gray-900 line-clamp-1">
                    {announcement.title}
                  </h3>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {announcement.class && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-blue-50 text-blue-700"
                      >
                        {announcement.class.name}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      {formatDate(announcement.date)}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-700 leading-relaxed">
                  {announcement.description}
                </p>

                {/* Metadata */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Bell className="h-3 w-3" />
                      {role === "admin" ? "All Users" : "Your Class"}
                    </span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Quick Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Showing {data.length} of 3 latest announcements
          </div>
          {data.some((announcement) => isRecent(announcement.date)) && (
            <Badge
              variant="outline"
              className="text-xs bg-green-50 text-green-700 border-green-200"
            >
              {
                data.filter((announcement) => isRecent(announcement.date))
                  .length
              }{" "}
              new
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Announcements;
