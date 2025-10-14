export const dynamic = "force-dynamic";

// app/list/teachers/page.tsx
import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Class, Prisma, Subject, Teacher } from "@prisma/client";
import { Filter, SortDesc } from "lucide-react";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { auth } from "@clerk/nextjs/server";
import { columns, TeacherWithRelations } from "./columns";
import { DataTable } from "@/components/DataTable";
import FormContainerServer from "@/components/FormContainerServer";

const TeacherListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.TeacherWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "classId":
            query.lessons = {
              some: {
                classId: value,
              },
            };
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  try {
    // First, get just the teacher data without relations
    const [teachers, count] = await prisma.$transaction([
      prisma.teacher.findMany({
        where: query,
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.teacher.count({ where: query }),
    ]);

    // Then, manually load the relations with error handling
    const teachersWithRelations = await Promise.all(
      teachers.map(async (teacher) => {
        try {
          const [subjects, classes] = await Promise.all([
            // Get subjects with error handling
            prisma.teacherSubject
              .findMany({
                where: { teacherId: teacher.id },
                include: {
                  subject: true,
                },
              })
              .then((results) => results.filter((ts) => ts.subject !== null))
              .catch(() => []), // If there's an error, return empty array

            // Get classes with error handling
            prisma.teacherClass
              .findMany({
                where: { teacherId: teacher.id },
                include: {
                  class: true,
                },
              })
              .then((results) => results.filter((tc) => tc.class !== null))
              .catch(() => []), // If there's an error, return empty array
          ]);

          return {
            ...teacher,
            subjects,
            classes,
          };
        } catch (error) {
          console.error(
            `Error loading relations for teacher ${teacher.id}:`,
            error
          );
          // Return teacher with empty relations if there's an error
          return {
            ...teacher,
            subjects: [],
            classes: [],
          };
        }
      })
    );

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        {/* TOP */}
        <div className="flex items-center justify-between">
          <h1 className="hidden md:block text-lg font-semibold">
            All Teachers
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            <TableSearch />
            <div className="flex items-center gap-4 self-end">
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <Filter size={14} />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
                <SortDesc size={14} />
              </button>
              {role === "admin" && (
                <FormContainerServer table="teacher" type="create" />
              )}
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <DataTable
          columns={columns}
          data={teachersWithRelations as TeacherWithRelations[]}
          searchKey="name"
          searchPlaceholder="Search teachers..."
        />

        {/* PAGINATION */}
        {/* <Pagination page={p} count={count} /> */}
      </div>
    );
  } catch (error) {
    console.error("Error fetching teachers:", error);

    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">All Teachers</h1>
        </div>
        <div className="mt-4 p-8 text-center">
          <p className="text-gray-500">Unable to load teachers at this time.</p>
          <p className="text-sm text-gray-400 mt-2">
            Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
};

export default TeacherListPage;
