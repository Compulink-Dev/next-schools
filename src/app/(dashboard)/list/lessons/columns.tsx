// app/list/lessons/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Lesson, Subject, Class, Teacher } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type LessonWithRelations = Lesson & {
  subject: Subject;
  class: Class;
  teacher: Teacher;
};

export const columns: ColumnDef<LessonWithRelations>[] = [
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
    accessorKey: "subject",
    header: "Subject Name",
    cell: ({ row }) => row.original.subject.name,
  },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) => row.original.class.name,
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    cell: ({ row }) =>
      `${row.original.teacher.name} ${row.original.teacher.surname}`,
    enableHiding: true,
  },
  {
    accessorKey: "schedule",
    header: "Schedule",
    cell: ({ row }) => {
      const lesson = row.original;
      // Format schedule information if available
      return lesson.day
        ? `${lesson.day} ${lesson.startTime}-${lesson.endTime}`
        : "Not scheduled";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lesson = row.original;
      const role = "admin"; // You'll need to get this from your auth context

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/lessons/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete lesson");
          }

          toast("Lesson deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete lesson");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/lessons/${lesson.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          {role === "admin" && (
            <>
              <FormContainer table="lesson" type="update" data={lesson} />
              <DeleteButton id={lesson.id} onDelete={handleDelete} />
            </>
          )}
        </div>
      );
    },
  },
];
