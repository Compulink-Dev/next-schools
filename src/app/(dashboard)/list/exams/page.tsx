export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Exam, Prisma, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";
import FilterSort from "@/components/FilterSort";

type ExamList = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const ExamListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const { page, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // Start with an empty query
  let query: Prisma.ExamWhereInput = {};

  // URL PARAMS CONDITION - Build these with OR logic
  const urlConditions: Prisma.ExamWhereInput[] = [];

  if (queryParams.classId) {
    urlConditions.push({ lesson: { classId: queryParams.classId } });
  }

  if (queryParams.teacherId) {
    urlConditions.push({ lesson: { teacherId: queryParams.teacherId } });
  }

  if (queryParams.search) {
    urlConditions.push({
      OR: [
        { title: { contains: queryParams.search, mode: "insensitive" } },
        {
          lesson: {
            subject: {
              name: { contains: queryParams.search, mode: "insensitive" },
            },
          },
        },
      ],
    });
  }

  // Combine URL conditions with OR if there are multiple, otherwise use the single condition
  if (urlConditions.length > 0) {
    if (urlConditions.length === 1) {
      query = urlConditions[0];
    } else {
      query = { OR: urlConditions };
    }
  }

  // ROLE CONDITIONS - Apply these separately with AND
  let roleCondition: Prisma.ExamWhereInput = {};

  if (role === "teacher") {
    roleCondition = { lesson: { teacherId: currentUserId! } };
  } else if (role === "student") {
    roleCondition = {
      lesson: {
        class: { students: { some: { id: currentUserId! } } },
      },
    };
  } else if (role === "parent") {
    roleCondition = {
      lesson: {
        class: { students: { some: { parentId: currentUserId! } } },
      },
    };
  }

  // Combine URL conditions with role conditions using AND
  if (Object.keys(query).length > 0 && Object.keys(roleCondition).length > 0) {
    query = { AND: [query, roleCondition] };
  } else if (Object.keys(roleCondition).length > 0) {
    query = roleCondition;
  }

  console.log("Final query:", JSON.stringify(query, null, 2)); // Debug log

  const [data, count] = await prisma.$transaction([
    prisma.exam.findMany({
      where: query,
      include: {
        lesson: {
          select: {
            subject: { select: { name: true } },
            teacher: { select: { name: true, surname: true } },
            class: { select: { name: true } },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        startTime: "desc",
      },
    }),
    prisma.exam.count({ where: query }),
  ]);

  console.log("Found exams:", data.length); // Debug log

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Exams</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mb-8">
          <TableSearch />
          <div className="flex items-center gap-4 self-end ">
            <FilterSort />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="exam" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      {data.length > 0 ? (
        <DataTable
          columns={columns as any}
          data={data}
          searchKey="title"
          searchPlaceholder="Search exam..."
        />
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No exams found</p>
          <p className="text-sm text-gray-400 mt-2">
            {role === "admin" || role === "teacher"
              ? "Create your first exam using the button above"
              : "There are no exams available for you at the moment"}
          </p>
        </div>
      )}
      {/* PAGINATION */}
      {/* <Pagination page={p} count={count} /> */}
    </div>
  );
};

export default ExamListPage;
