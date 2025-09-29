"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Parent, Student } from "@prisma/client";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";

export type ParentWithRelations = Parent & {
  students: Student[];
};

export const columns: ColumnDef<ParentWithRelations>[] = [
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
    header: "Parent",
    cell: ({ row }) => {
      const parent = row.original;
      return (
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="font-semibold text-green-800">
              {parent.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold">{parent.name}</h3>
            <p className="text-xs text-gray-500">{parent.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "students",
    header: "Students",
    cell: ({ row }) => {
      const students = row.original.students;
      return students.length > 0
        ? students.map((s) => s.name).join(", ")
        : "No students assigned";
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone || "N/A",
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address || "N/A",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const parent = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/parents/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete parent");
          }

          toast("Parent deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete parent");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/parents/${parent.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={parent.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
