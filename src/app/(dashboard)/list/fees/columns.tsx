"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Fee, Class, Student } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type FeeWithRelations = Fee & {
  class?: Class;
  student?: Student;
};

export const columns: ColumnDef<FeeWithRelations>[] = [
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
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-semibold">${row.original.amount.toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(row.original.dueDate)}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(row.original.dueDate) < new Date() ? (
            <span className="text-red-600">Overdue</span>
          ) : (
            "Due soon"
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) => (
      <span className={!row.original.class ? "text-gray-500 italic" : ""}>
        {row.original.class?.name || "All Classes"}
      </span>
    ),
  },
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => (
      <span className={!row.original.student ? "text-gray-500 italic" : ""}>
        {row.original.student
          ? `${row.original.student.name} ${row.original.student.surname}`
          : "All Students"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const fee = row.original;
      const now = new Date();
      const dueDate = new Date(fee.dueDate);

      if (fee.paid) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Paid
          </span>
        );
      } else if (now > dueDate) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Overdue
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const fee = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/fees/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete fee");
          }

          toast("Fee deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete fee");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/fees/${fee.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <FormContainer table="fee" type="update" data={fee} />
          <DeleteButton id={fee.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
