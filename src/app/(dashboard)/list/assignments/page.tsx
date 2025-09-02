import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
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
import { format } from "date-fns";

type AssignmentList = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
  results: Result[]; // Include results in the type
};

const AssignmentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  const columns = [
    {
      header: "Title",
      accessor: "title",
      className: "text-left", // Add text-left for left alignment
    },
    {
      header: "Subject Name",
      accessor: "name",
      className: "text-left", // Add text-left for left alignment
    },
    {
      header: "Class",
      accessor: "class",
      className: "text-left", // Add text-left for left alignment
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell text-left", // Add text-left for left alignment
    },
    {
      header: "Start Date",
      accessor: "startDate",
      className: "hidden md:table-cell text-left", // Add text-left for left alignment
    },
    {
      header: "Due Date",
      accessor: "dueDate",
      className: "hidden md:table-cell text-left", // Add text-left for left alignment
    },
    ...(role === "admin" || role === "teacher"
      ? [
          {
            header: "Actions",
            accessor: "action",
            className: "text-left", // Add text-left for left alignment
          },
        ]
      : []),
  ];

  const renderRow = (item: AssignmentList) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaYellowLight"
    >
      <td className="p-4 text-left">{item.title}</td>
      <td className="p-4 text-left">{item.lesson.subject.name}</td>
      <td className="text-left">{item.lesson.class.name}</td>
      <td className="hidden md:table-cell text-left">
        {item.lesson.teacher.name + " " + item.lesson.teacher.surname}
      </td>
      <td className="hidden md:table-cell text-left">
        {format(new Date(item.startDate), "MM/dd/yyyy")}
      </td>
      <td className="hidden md:table-cell text-left">
        {format(new Date(item.dueDate), "MM/dd/yyyy")}
      </td>
      <td className="text-left">
        <div className="flex items-center gap-2">
          {(role === "admin" || role === "teacher") && (
            <>
              <FormContainer table="assignment" type="update" data={item} />
              <FormContainer table="assignment" type="delete" id={item.id} />
            </>
          )}
        </div>
      </td>
    </tr>
  );

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  const query: Prisma.AssignmentWhereInput = {};

  query.lesson = {};

  if (queryParams) {
    const lessonQuery: Prisma.LessonWhereInput = {};
    if (queryParams.classId) {
      //@ts-ignore
      lessonQuery.classId = parseInt(queryParams.classId);
    }
    if (queryParams.teacherId) {
      lessonQuery.teacherId = queryParams.teacherId;
    }
    if (queryParams.title) {
      query.title = { contains: queryParams.title, mode: "insensitive" };
    }
    if (queryParams.search) {
      lessonQuery.subject = {
        name: { contains: queryParams.search, mode: "insensitive" },
      };
    }
    query.lesson = lessonQuery;
  }

  switch (role) {
    case "admin":
      break;
    case "teacher":
      query.lesson.teacherId = currentUserId!;
      break;
    case "student":
      query.lesson.class = {
        students: {
          some: {
            id: currentUserId!,
          },
        },
      };
      break;
    case "parent":
      query.lesson.class = {
        students: {
          some: {
            parentId: currentUserId!,
          },
        },
      };
      break;
    default:
      break;
  }

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
          results: true, // Include the results
        },
        take: ITEM_PER_PAGE,
        skip: ITEM_PER_PAGE * (p - 1),
      }),
      prisma.assignment.count({ where: query }),
    ]);

    return (
      <div className="bg-white p-4 rounded-md m-4 mt-0 w-full">
        {/* Removed overflow-hidden from here */}
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
          {/* Added horizontal scrolling */}
          <Table columns={columns} renderRow={renderRow} data={data} />
        </div>
        <Pagination count={count} page={p} />
      </div>
    );
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return <div>Error loading assignments. Please try again.</div>;
  }
};

export default AssignmentListPage;
