"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Assignment, Class, Subject, Teacher, Result } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";
import { format } from "date-fns";

export type AssignmentWithRelations = Assignment & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
  results: Result[];
};

export const columns: ColumnDef<AssignmentWithRelations>[] = [
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
    header: "Title",
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
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.original.startDate), "MM/dd/yyyy"),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => format(new Date(row.original.dueDate), "MM/dd/yyyy"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const assignment = row.original;
      const now = new Date();
      const startDate = new Date(assignment.startDate);
      const dueDate = new Date(assignment.dueDate);

      if (now < startDate) {
        return <span className="text-blue-600">Upcoming</span>;
      } else if (now > dueDate) {
        return <span className="text-red-600">Overdue</span>;
      } else {
        return <span className="text-green-600">Active</span>;
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const assignment = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/assignments/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete assignment");
          }

          toast("Assignment deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete assignment");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/assignments/${assignment.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <FormContainer table="assignment" type="update" data={assignment} />
          <DeleteButton id={assignment.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
