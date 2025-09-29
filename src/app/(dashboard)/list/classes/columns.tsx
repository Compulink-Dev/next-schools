// app/list/classes/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Class, Teacher, Grade } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";

export type ClassWithRelations = Class & {
  supervisor?: Teacher | null;
  grade?: Grade | null; // Make grade optional
  _count?: {
    students: number;
  };
};

export const columns: ColumnDef<ClassWithRelations>[] = [
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
    header: "Class Name",
    cell: ({ row }) => {
      const classItem = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="font-semibold text-green-800">
              {classItem.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{classItem.name}</h3>
            <p className="text-sm text-gray-500">
              {classItem.grade ? `Grade ${classItem.grade.level}` : "No grade"}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "supervisor",
    header: "Supervisor",
    cell: ({ row }) => {
      const supervisor = row.original.supervisor;
      return supervisor
        ? `${supervisor.name} ${supervisor.surname}`
        : "No supervisor assigned";
    },
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({ row }) => {
      const classItem = row.original;
      const studentCount = classItem._count?.students || 0;
      const capacity = classItem.capacity;

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {studentCount} / {capacity} students
          </span>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{ width: `${(studentCount / capacity) * 100}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "grade",
    header: "Grade Level",
    cell: ({ row }) => {
      const grade = row.original.grade;
      return grade ? `Grade ${grade.level}` : "No grade";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const classItem = row.original;
      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/classes/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete class");
          }

          toast("Class deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete class");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/classes/${classItem.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={classItem.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
