"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Attendance,
  Class,
  Lesson,
  Student,
  Subject,
  Teacher,
} from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type AttendanceWithRelations = Attendance & {
  student: Student;
  lesson: Lesson & {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

export const columns: ColumnDef<AttendanceWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4 rounded border-gray-300"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "student",
    header: "Student Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="font-semibold text-purple-800">
            {row.original.student.name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h3 className="font-semibold">
            {row.original.student.name} {row.original.student.surname}
          </h3>
          <p className="text-xs text-gray-500">{row.original.student.email}</p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => row.original.lesson.subject.name,
  },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) => row.original.lesson.class.name,
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    cell: ({ row }) =>
      `${row.original.lesson.teacher.name} ${row.original.lesson.teacher.surname}`,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("en-US").format(row.original.date),
  },
  {
    accessorKey: "present",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.present
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {row.original.present ? "Present" : "Absent"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const attendance = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/attendance/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete attendance");
          }

          toast("Attendance record deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete attendance");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/attendance/${attendance.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <FormContainer table="attendance" type="update" data={attendance} />
          <DeleteButton id={attendance.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
