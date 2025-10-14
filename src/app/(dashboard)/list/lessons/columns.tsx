"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";
import { LessonWithRelations } from "../../../../../types/lessons";

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
    accessorKey: "subject.name",
    header: "Subject Name",
  },
  {
    accessorKey: "class.name",
    header: "Class",
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    cell: ({ row }) =>
      `${row.original.teacher.name} ${row.original.teacher.surname}`,
  },
  {
    accessorKey: "schedule",
    header: "Schedule",
    cell: ({ row }) => {
      const lesson = row.original;
      return lesson.day
        ? `${lesson.day} ${new Date(lesson.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}-${new Date(lesson.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "Not scheduled";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lesson = row.original;
      const role = "admin";

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/lessons/${id}`, {
            method: "DELETE",
          });
          if (!response.ok) throw new Error("Failed to delete lesson");
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
              <DeleteButton id={lesson.id} onDelete={handleDelete} />
            </>
          )}
        </div>
      );
    },
  },
];
