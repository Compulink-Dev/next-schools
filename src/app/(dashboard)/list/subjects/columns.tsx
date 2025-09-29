// app/list/subjects/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Subject, Teacher, TeacherSubject } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";

export type SubjectWithRelations = Subject & {
  teachers: (TeacherSubject & { teacher: Teacher })[];
};

export const columns: ColumnDef<SubjectWithRelations>[] = [
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
    accessorKey: "name",
    header: "Subject Name",
    cell: ({ row }) => {
      const subject = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="font-semibold text-blue-800">
              {subject.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{subject.name}</h3>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "teachers",
    header: "Teachers",
    cell: ({ row }) => {
      const teachers = row.original.teachers;
      return teachers.length > 0
        ? teachers
            .map((t) => `${t.teacher.name} ${t.teacher.surname}`)
            .join(", ")
        : "No teachers assigned";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const subject = row.original;
      const handleDelete = async (id: string) => {
        // Call your API to delete the subject
        try {
          const response = await fetch(`/api/subjects/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete subject");
          }

          // Refresh the page or update the data
          toast("Subject deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete subject");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/subjects/${subject.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={subject.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
