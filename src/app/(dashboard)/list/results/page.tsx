export const dynamic = "force-dynamic";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { DataTable } from "@/components/DataTable";
import { columns, ResultList } from "./columns";
import FilterSort from "@/components/FilterSort";

const ResultListPage = async ({
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
  const conditions: Prisma.ResultWhereInput[] = [];

  // URL PARAMS CONDITION
  if (queryParams.studentId) {
    conditions.push({ studentId: queryParams.studentId });
  }

  if (queryParams.classId) {
    conditions.push({
      OR: [
        { exam: { lesson: { classId: queryParams.classId } } },
        { assignment: { lesson: { classId: queryParams.classId } } },
      ],
    });
  }

  if (queryParams.search) {
    conditions.push({
      OR: [
        {
          exam: {
            title: { contains: queryParams.search, mode: "insensitive" },
          },
        },
        {
          assignment: {
            title: { contains: queryParams.search, mode: "insensitive" },
          },
        },
        {
          student: {
            name: { contains: queryParams.search, mode: "insensitive" },
          },
        },
        {
          student: {
            surname: { contains: queryParams.search, mode: "insensitive" },
          },
        },
      ],
    });
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    conditions.push({
      OR: [
        { exam: { lesson: { teacherId: currentUserId! } } },
        { assignment: { lesson: { teacherId: currentUserId! } } },
      ],
    });
  } else if (role === "student") {
    conditions.push({ studentId: currentUserId! });
  } else if (role === "parent") {
    conditions.push({ student: { parentId: currentUserId! } });
  }

  // Combine all conditions with AND
  const query: Prisma.ResultWhereInput =
    conditions.length > 0 ? { AND: conditions } : {};

  const [dataRes, count] = await prisma.$transaction([
    prisma.result.findMany({
      where: query,
      include: {
        student: { select: { name: true, surname: true } },
        exam: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              select: {
                class: { select: { name: true } },
                teacher: { select: { name: true, surname: true } },
              },
            },
          },
        },
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.result.count({ where: query }),
  ]);

  // Transform data with better structure and calculate grades
  const data: ResultList[] = dataRes
    .map((item) => {
      const assessment = item.exam || item.assignment;

      if (!assessment) {
        console.warn(
          `❌ Skipped result ID ${item.id} — no exam or assignment.`
        );
        return null;
      }

      const isExam = "startTime" in assessment;
      const maxScore = isExam ? 100 : (assessment as any).totalPoints || 100;
      const percentage = (item.score / maxScore) * 100;

      // Calculate grade
      let grade = "";
      if (percentage >= 90) grade = "A+";
      else if (percentage >= 85) grade = "A";
      else if (percentage >= 80) grade = "A-";
      else if (percentage >= 75) grade = "B+";
      else if (percentage >= 70) grade = "B";
      else if (percentage >= 65) grade = "B-";
      else if (percentage >= 60) grade = "C+";
      else if (percentage >= 55) grade = "C";
      else if (percentage >= 50) grade = "C-";
      else if (percentage >= 45) grade = "D+";
      else if (percentage >= 40) grade = "D";
      else grade = "F";

      return {
        id: item.id,
        title: assessment.title,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        teacherName: assessment.lesson.teacher.name,
        teacherSurname: assessment.lesson.teacher.surname,
        score: item.score,
        maxScore: maxScore,
        className: assessment.lesson.class.name,
        startTime: isExam
          ? (assessment as any).startTime
          : (assessment as any).startDate,
        type: isExam ? "exam" : "assignment",
        percentage: percentage,
        grade: grade,
      };
    })
    .filter(Boolean) as ResultList[];

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Results</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto mb-8">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <FilterSort />
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="result" type="create" />
            )}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data}
        searchKey="title"
        searchPlaceholder="Search results..."
      />
      {/* <Pagination page={p} count={count} /> */}
    </div>
  );
};

export default ResultListPage;
