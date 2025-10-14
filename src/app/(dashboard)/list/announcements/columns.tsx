"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Announcement, Class } from "@prisma/client";
import { Eye, Megaphone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type AnnouncementWithRelations = Announcement & {
  class?: Class | null;
};

export const columns: ColumnDef<AnnouncementWithRelations>[] = [
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
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Megaphone size={16} className="text-lamaPurple" />
        <span className="font-medium">{row.original.title}</span>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div
        className="max-w-xs truncate"
        title={row.original.description ?? undefined}
      >
        {row.original.description || "No description"}
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(row.original.date)}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(row.original.date) < new Date() ? "Past" : "Upcoming"}
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
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.priority?.toLowerCase() || "normal";
      const priorityColors = {
        high: "bg-red-100 text-red-800",
        medium: "bg-yellow-100 text-yellow-800",
        normal: "bg-blue-100 text-blue-800",
        low: "bg-gray-100 text-gray-800",
      };

      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
            priorityColors[priority as keyof typeof priorityColors] ||
            priorityColors.normal
          }`}
        >
          {priority}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const announcement = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/announcements/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete announcement");
          }

          toast("Announcement deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete announcement");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/announcements/${announcement.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={announcement.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
