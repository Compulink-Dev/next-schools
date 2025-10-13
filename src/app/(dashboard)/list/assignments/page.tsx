import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import {
  Assignment,
  Class,
  Prisma,
  Subject,
  Teacher,
  Result,
} from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
  results: Result[];
};

const AssignmentListPage = async ({
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
  const conditions: Prisma.AssignmentWhereInput[] = [];

  // URL PARAMS CONDITION
  if (queryParams.classId) {
    conditions.push({ lesson: { classId: queryParams.classId } });
  }

  if (queryParams.teacherId) {
    conditions.push({ lesson: { teacherId: queryParams.teacherId } });
  }

  if (queryParams.search) {
    conditions.push({
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

  // ROLE CONDITIONS
  if (role === "teacher") {
    conditions.push({ lesson: { teacherId: currentUserId! } });
  } else if (role === "student") {
    conditions.push({
      lesson: {
        class: { students: { some: { id: currentUserId! } } },
      },
    });
  } else if (role === "parent") {
    conditions.push({
      lesson: {
        class: { students: { some: { parentId: currentUserId! } } },
      },
    });
  }

  // Combine all conditions with AND
  const query: Prisma.AssignmentWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  try {
    const [data, count] = await prisma.$transaction([
      prisma.assignment.findMany({
        where: query,
        include: {
          lesson: {
            select: {
              subject: { select: { name: true } },
              teacher: { select: { name: true, surname: true } },
              class: { select: { name: true } },
            },
          },
          results: true,
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
        orderBy: {
          dueDate: "asc",
        },
      }),
      prisma.assignment.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md m-4 mt-0 w-full">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
          <h1 className="text-base md:text-lg font-semibold whitespace-nowrap">
            All Assignments
          </h1>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
            <TableSearch />
            <div className="flex items-center gap-2">
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/filter.png" alt="Filter" width={12} height={12} />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaYellow">
                <Image src="/sort.png" alt="Sort" width={12} height={12} />
              </button>
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="assignment" type="create" />
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            //@ts-expect-error columns type not talling
            columns={columns}
            data={data}
            searchKey="title"
            searchPlaceholder="Search assignment..."
          />
        </div>
        {/* <Pagination count={count} page={p} /> */}
      </div>
    );
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return <div>Error loading assignments. Please try again.</div>;
  }
};

export default AssignmentListPage;
