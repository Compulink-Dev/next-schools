export const dynamic = "force-dynamic";

// app/list/students/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Eye } from "lucide-react";
import FormContainerServer from "@/components/FormContainerServer";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import FilterSort from "@/components/FilterSort";

type StudentList = Student & {
  class?: Class | null;
  parent?: any | null;
  grade?: any | null;
};

const StudentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.StudentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "teacherId":
            query.class = {
              lessons: {
                some: {
                  teacherId: value,
                },
              },
            };
            break;
          case "search":
            query.OR = [
              { name: { contains: value, mode: "insensitive" } },
              { surname: { contains: value, mode: "insensitive" } },
              { email: { contains: value, mode: "insensitive" } },
            ];
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    const [data, count] = await prisma.$transaction([
      prisma.student.findMany({
        where: query,
        include: {
          class: true,
          parent: true,
          grade: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where: query }),
    ]);

    // Transform data to handle null values safely
    const safeData = data.map((student) => ({
      ...student,
      bloodType: student.bloodType || "Not specified",
      class: student.class || null,
      parent: student.parent || null,
      grade: student.grade || null,
      email: student.email || "No email",
      phone: student.phone || "No phone",
      address: student.address || "No address",
    }));

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="hidden md:block text-lg font-semibold">
            All Students
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <FilterSort />
              {role === "admin" && (
                <FormContainerServer table="student" type="create" />
              )}
            </div>
          </div>
        </div>
        {/* LIST */}
        <DataTable
          columns={columns}
          data={safeData}
          searchKey="name"
          searchPlaceholder="Search student..."
        />
        {/* PAGINATION */}
        <Pagination page={p} count={count} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching students:", error);

    // Fallback UI
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">All Students</h1>
        </div>
        <div className="mt-4 p-8 text-center">
          <p className="text-gray-500">Unable to load students at this time.</p>
          <p className="text-sm text-gray-400 mt-2">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
};

export default StudentListPage;
