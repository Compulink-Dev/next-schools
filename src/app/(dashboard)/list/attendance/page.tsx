export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  Attendance,
  Class,
  Lesson,
  Prisma,
  Student,
  Subject,
  Teacher,
} from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";

type AttendanceList = Attendance & {
  student: Student;
  lesson: Lesson & {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const AttendanceListPage = async ({
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
  const conditions: Prisma.AttendanceWhereInput[] = [];

  // URL PARAMS CONDITION
  if (queryParams.classId) {
    conditions.push({ lesson: { classId: queryParams.classId } });
  }

  if (queryParams.teacherId) {
    conditions.push({ lesson: { teacherId: queryParams.teacherId } });
  }

  if (queryParams.search) {
    conditions.push({
      student: {
        OR: [
          { name: { contains: queryParams.search, mode: "insensitive" } },
          { surname: { contains: queryParams.search, mode: "insensitive" } },
        ],
      },
    });
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    conditions.push({ lesson: { teacherId: currentUserId! } });
  } else if (role === "student") {
    conditions.push({ studentId: currentUserId! });
  } else if (role === "parent") {
    conditions.push({ student: { parentId: currentUserId! } });
  }

  // Combine all conditions with AND
  const query: Prisma.AttendanceWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const [data, count] = await prisma.$transaction([
    prisma.attendance.findMany({
      where: query,
      include: {
        student: true,
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        date: "desc",
      },
    }),
    prisma.attendance.count({ where: query }),
  ]);

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          Attendance Records
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
              <FormContainer table="attendance" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <DataTable
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search attendance..."
      />
      {/* PAGINATION */}
      {/* <Pagination page={p} count={count} /> */}
    </div>
  );
};

export default AttendanceListPage;
