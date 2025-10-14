// app/list/announcements/page.tsx
import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";

type AnnouncementList = Announcement & {
  class?: Class;
};

const AnnouncementListPage = async ({
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
  const conditions: Prisma.AnnouncementWhereInput[] = [];

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

  if (queryParams.priority) {
    conditions.push({
      priority: { equals: queryParams.priority, mode: "insensitive" },
    });
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    // Teachers can see announcements for classes they supervise AND school-wide announcements
    conditions.push({
      OR: [
        { class: { supervisorId: currentUserId! } },
        { classId: null }, // School-wide announcements
      ],
    });
  } else if (role === "student") {
    const student = await prisma.student.findUnique({
      where: { clerkId: currentUserId! },
    });
    if (student) {
      conditions.push({
        OR: [
          { classId: student.classId },
          { classId: null }, // School-wide announcements
        ],
      });
    } else {
      // If student not found, show only school-wide announcements
      conditions.push({ classId: null });
    }
  } else if (role === "parent") {
    const student = await prisma.student.findFirst({
      where: { parent: { clerkId: currentUserId! } },
    });
    if (student) {
      conditions.push({
        OR: [
          { classId: student.classId },
          { classId: null }, // School-wide announcements
        ],
      });
    } else {
      // If student not found, show only school-wide announcements
      conditions.push({ classId: null });
    }
  }

  // Combine all conditions with AND
  const query: Prisma.AnnouncementWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  try {
    const [data, count] = await prisma.$transaction([
      prisma.announcement.findMany({
        where: query,
        include: {
          class: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: {
          date: "desc",
        },
      }),
      prisma.announcement.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            Announcements
          </h1>
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
                <FormContainer table="announcement" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <DataTable
          columns={columns}
          data={data}
          searchKey="title"
          searchPlaceholder="Search announcements..."
        />
      </div>
    );
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Announcements</h1>
        </div>
        <div className="mt-4 p-8 text-center">
          <p className="text-gray-500">
            Unable to load announcements at this time.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
};

export default AnnouncementListPage;
