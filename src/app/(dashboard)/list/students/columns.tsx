"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Student, Parent, Grade, Class } from "@prisma/client";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";

export type StudentWithRelations = Student & {
  parent?: Parent | null;
  grade?: Grade | null;
  class?: Class | null;
};

export const columns: ColumnDef<StudentWithRelations>[] = [
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
    header: "Student",
    cell: ({ row }) => {
      const student = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="font-semibold text-purple-800">
              {student.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">
              {student.name} {student.surname}
            </h3>
            <p className="text-xs text-gray-500">{student.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "parent",
    header: "Parent",
    cell: ({ row }) => {
      const parent = row.original.parent;
      return parent ? `${parent.name} ${parent.surname}` : "No parent assigned";
    },
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => {
      const grade = row.original.grade;
      return grade ? `Grade ${grade.level}` : "N/A";
    },
  },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) => {
      const classItem = row.original.class;
      return classItem ? classItem.name : "N/A";
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || "N/A",
  },
  {
    accessorKey: "bloodType",
    header: "Blood Type",
    cell: ({ row }) => row.original.bloodType || "N/A",
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address || "N/A",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const student = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/students/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete student");
          }

          toast("Student deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete student");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/students/${student.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={student.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
