import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Announcement, Class } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  let statusColor = "text-green-600";
  let statusBg = "bg-green-50";

  if (now < announcementDate) {
    status = "Upcoming";
    statusColor = "text-blue-600";
    statusBg = "bg-blue-50";
  } else if (
    now.getTime() - announcementDate.getTime() >
    7 * 24 * 60 * 60 * 1000
  ) {
    status = "Archived";
    statusColor = "text-gray-600";
    statusBg = "bg-gray-50";
  }

  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    normal: "bg-blue-100 text-blue-800 border-blue-200",
    low: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const priority = announcement.priority?.toLowerCase() || "normal";

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* ANNOUNCEMENT INFO CARD */}
          <div
            className={`py-6 px-4 rounded-md flex-1 flex gap-4 ${statusBg} border ${
              priorityColors[priority as keyof typeof priorityColors] ||
              priorityColors.normal
            }`}
          >
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-lamaPurple flex items-center justify-center">
                <Image
                  src="/announcement.png"
                  alt="Announcement"
                  width={64}
                  height={64}
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{announcement.title}</h1>
                {(role === "admin" || role === "teacher") && (
                  <FormContainer
                    table="announcement"
                    type="update"
                    data={announcement}
                  />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {announcement.description || "No description provided"}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/calendar.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }).format(announcementDate)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{announcement.class?.name || "All Classes"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/priority.png" alt="" width={14} height={14} />
                  <span className="capitalize font-semibold">
                    {announcement.priority || "Normal"}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/status.png" alt="" width={14} height={14} />
                  <span className={`font-semibold ${statusColor}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ANNOUNCEMENT DETAILS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Announcement Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Full Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {announcement.description ||
                  "No detailed description provided."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Announcement Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(announcementDate)}
                  </p>
                  <p>
                    <strong>Priority:</strong>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        priorityColors[
                          priority as keyof typeof priorityColors
                        ] || priorityColors.normal
                      }`}
                    >
                      {priority}
                    </span>
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={statusColor}>{status}</span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Audience</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Target:</strong>{" "}
                    {announcement.class?.name || "All Classes"}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {announcement.class ? "Class-specific" : "School-wide"}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "short",
                    }).format(announcement.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Quick Links</h1>
          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500">
            {announcement.class && (
              <Link
                className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
                href={`/list/classes/${announcement.class.id}`}
              >
                Class Details
              </Link>
            )}
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/announcements?classId=${announcement.classId || ""}`}
            >
              More {announcement.class?.name ? "Class" : "School"} Announcements
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href="/calendar"
            >
              View Calendar
            </Link>
          </div>
        </div>

        {/* ANNOUNCEMENT STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Announcement Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`font-semibold ${statusColor}`}>{status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Priority</span>
              <span
                className={`font-semibold capitalize ${
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
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Audience</span>
              <span className="font-semibold">
                {announcement.class?.name || "All Classes"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Days Since</span>
              <span className="font-semibold">
                {Math.ceil(
                  (now.getTime() - announcementDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </span>
            </div>
          </div>
        </div>

        {/* RECENT ANNOUNCEMENTS */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
          <div className="space-y-2 text-sm">
            <p className="text-gray-500 text-center py-4">
              Check the announcements page for latest updates
            </p>
            <Link
              href="/list/announcements"
              className="block text-center text-lamaPurple hover:text-lamaPurpleDark text-sm font-medium"
            >
              View All Announcements →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleAnnouncementPage;
