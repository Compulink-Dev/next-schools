"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Exam, Class, Subject, Teacher } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type ExamWithRelations = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

export const columns: ColumnDef<ExamWithRelations>[] = [
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
    accessorKey: "title",
    header: "Exam Title",
  },
  {
    accessorKey: "subject",
    header: "Subject Name",
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
    accessorKey: "startTime",
    header: "Date",
    cell: ({ row }) =>
      new Intl.DateTimeFormat("en-US").format(row.original.startTime),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => {
      const start = new Date(row.original.startTime);
      const end = new Date(row.original.endTime);
      const duration = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60)
      ); // in minutes
      return `${duration} min`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const exam = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/exams/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete exam");
          }

          toast("Exam deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete exam");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/exams/${exam.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <FormContainer table="exam" type="update" data={exam} />
          <DeleteButton id={exam.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
