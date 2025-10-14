// app/list/grades/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Grade, Class } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";

export type GradeWithRelations = Grade & {
  classes?: Class[];
  _count?: {
    students: number;
    classes: number;
  };
};

export const columns: ColumnDef<GradeWithRelations>[] = [
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
    accessorKey: "level",
    header: "Grade Level",
    cell: ({ row }) => {
      const grade = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="font-semibold text-purple-800">{grade.level}</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">Grade {grade.level}</h3>
            <p className="text-sm text-gray-500">
              {grade.description || "No description"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "students",
    header: "Students",
    cell: ({ row }) => {
      const studentCount = row.original._count?.students || 0;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{studentCount}</span>
          <span className="text-sm text-gray-500">students</span>
        </div>
      );
    },
  },
  {
    accessorKey: "classes",
    header: "Classes",
    cell: ({ row }) => {
      const classCount = row.original._count?.classes || 0;
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{classCount}</span>
          <span className="text-sm text-gray-500">classes</span>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {description || "No description"}
        </p>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const grade = row.original;
      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/grades/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete grade");
          }

          toast("Grade deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete grade");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/grades/${grade.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={grade.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
