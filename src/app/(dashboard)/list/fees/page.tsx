import FormContainer from "@/components/FormContainer";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { Fee, Class, Student, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns } from "./columns";

type FeeWithRelations = Fee & {
  class?: Class | null;
  student?: Student | null;
};

const FeesPage = async ({
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
  const conditions: Prisma.FeeWhereInput[] = [];

  // URL PARAMS CONDITION
  if (queryParams.classId) {
    conditions.push({ classId: queryParams.classId });
  }

  if (queryParams.studentId) {
    conditions.push({ studentId: queryParams.studentId });
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
  if (role === "student") {
    conditions.push({ studentId: currentUserId! });
  } else if (role === "parent") {
    // Parents can see fees for their children
    const student = await prisma.student.findFirst({
      where: { parentId: currentUserId! },
    });
    if (student) {
      conditions.push({ studentId: student.id });
    } else {
      // If no student found, show no fees
      conditions.push({ id: "-1" }); // This will return empty results
    }
  } else if (role === "teacher") {
    // Teachers can see fees for their classes
    const teacherClasses = await prisma.class.findMany({
      where: { supervisorId: currentUserId! },
      select: { id: true },
    });
    const classIds = teacherClasses.map((c) => c.id);
    conditions.push({
      OR: [
        { classId: { in: classIds } },
        { classId: null }, // School-wide fees
      ],
    });
  }

  // Combine all conditions with AND
  const query: Prisma.FeeWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const fees = await prisma.fee.findMany({
    where: query,
    include: {
      class: { select: { name: true } },
      student: { select: { name: true, surname: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">Fees</h1>
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
              <FormContainer table="fee" type="create" />
            )}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        //@ts-expect-error name and surname missing form the field
        data={fees}
        searchKey="title"
        searchPlaceholder="Search fee..."
      />
    </div>
  );
};

export default FeesPage;
