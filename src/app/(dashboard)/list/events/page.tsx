import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";

type EventList = Event & {
  class?: Class | null;
};

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Build query conditions
  const conditions: Prisma.EventWhereInput[] = [];

  // URL PARAMS CONDITION
  if (queryParams.classId) {
    conditions.push({ classId: queryParams.classId });
  }

  if (queryParams.search) {
    conditions.push({
      OR: [
        { title: { contains: queryParams.search, mode: "insensitive" } },
        { description: { contains: queryParams.search, mode: "insensitive" } },
      ],
    });
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    // Teachers can see events for classes they supervise AND school-wide events (classId = null)
    conditions.push({
      OR: [
        { class: { supervisorId: currentUserId! } },
        { classId: null }, // School-wide events
      ],
    });
  } else if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { id: currentUserId! },
    });
    if (student) {
      conditions.push({
        OR: [
          { classId: student.classId },
          { classId: null }, // School-wide events
        ],
      });
    } else {
      // If student not found, show only school-wide events
      conditions.push({ classId: null });
    }
  } else if (role === "parent") {
    const student = await prisma.student.findFirst({
      where: { parentId: currentUserId! },
    });
    if (student) {
      conditions.push({
        OR: [
          { classId: student.classId },
          { classId: null }, // School-wide events
        ],
      });
    } else {
      // If student not found, show only school-wide events
      conditions.push({ classId: null });
    }
  }

  // Combine all conditions with AND
  const query: Prisma.EventWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        startTime: "asc",
      },
    }),
    prisma.event.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="event" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <DataTable
        columns={columns}
        //@ts-expect-errors data not working properly
        data={data}
        searchKey="title"
        searchPlaceholder="Search event..."
      />
      {/* PAGINATION */}
      {/* <Pagination page={p} count={count} /> */}
    </div>
  );
};

export default EventListPage;
