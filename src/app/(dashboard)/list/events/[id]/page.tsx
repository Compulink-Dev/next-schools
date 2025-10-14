import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Event, Class } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  let statusColor = "text-green-600";
  let statusBg = "bg-green-50";

  if (now < startTime) {
    status = "Upcoming";
    statusColor = "text-blue-600";
    statusBg = "bg-blue-50";
  } else if (now > endTime) {
    status = "Completed";
    statusColor = "text-gray-600";
    statusBg = "bg-gray-50";
  }

  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
  ); // in hours

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* EVENT INFO CARD */}
          <div
            className={`py-6 px-4 rounded-md flex-1 flex gap-4 ${statusBg} border`}
          >
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-lamaPurple flex items-center justify-center">
                <Image
                  src="/event.png"
                  alt="Event"
                  width={64}
                  height={64}
                  className="text-white"
                />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{event.title}</h1>
                {(role === "admin" || role === "teacher") && (
                  <FormContainer table="event" type="update" data={event} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {event.description || "No description provided"}
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
                    }).format(startTime)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/time.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(startTime)}{" "}
                    -{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(endTime)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/duration.png" alt="" width={14} height={14} />
                  <span>
                    {duration} hour{duration !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{event.class?.name || "All Classes"}</span>
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

        {/* EVENT DETAILS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Event Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600">
                {event.description || "No description provided."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Date & Time</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Start:</strong>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(startTime)}
                  </p>
                  <p>
                    <strong>End:</strong>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                      timeStyle: "short",
                    }).format(endTime)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Event Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Duration:</strong> {duration} hour
                    {duration !== 1 ? "s" : ""}
                  </p>
                  <p>
                    <strong>Audience:</strong>{" "}
                    {event.class?.name || "All Classes"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={statusColor}>{status}</span>
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
            {event.class && (
              <Link
                className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
                href={`/list/classes/${event.class.id}`}
              >
                Class Details
              </Link>
            )}
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
              href={`/list/events?classId=${event.classId || ""}`}
            >
              More {event.class?.name ? "Class" : "School"} Events
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href="/calendar"
            >
              View Calendar
            </Link>
          </div>
        </div>

        {/* EVENT STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Event Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`font-semibold ${statusColor}`}>{status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="font-semibold">
                {duration} hour{duration !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Audience</span>
              <span className="font-semibold">
                {event.class?.name || "All Classes"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Created</span>
              <span className="font-semibold">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "short",
                }).format(event.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* UPCOMING EVENTS */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Upcoming Events</h2>
          <div className="space-y-2 text-sm">
            {/* You could fetch and display upcoming events here */}
            <p className="text-gray-500 text-center py-4">
              Check the calendar for upcoming events
            </p>
            <Link
              href="/calendar"
              className="block text-center text-lamaPurple hover:text-lamaPurpleDark text-sm font-medium"
            >
              View Full Calendar →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleEventPage;
