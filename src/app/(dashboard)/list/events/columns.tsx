"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Event, Class } from "@prisma/client";
import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type EventWithRelations = Event & {
  class?: Class;
};

export const columns: ColumnDef<EventWithRelations>[] = [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.original.description}>
        {row.original.description || "No description"}
      </div>
    ),
  },
  {
    accessorKey: "startTime",
    header: "Start Time",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(row.original.startTime)}
        </div>
        <div className="text-xs text-gray-500">
          {new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(row.original.startTime)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "endTime",
    header: "End Time",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(row.original.endTime)}
        </div>
        <div className="text-xs text-gray-500">
          {new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(row.original.endTime)}
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const now = new Date();
      const startTime = new Date(row.original.startTime);
      const endTime = new Date(row.original.endTime);

      if (now < startTime) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Upcoming
          </span>
        );
      } else if (now > endTime) {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Completed
          </span>
        );
      } else {
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Ongoing
          </span>
        );
      }
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const event = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/events/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete event");
          }

          toast("Event deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete event");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/events/${event.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <FormContainer table="event" type="update" data={event} />
          <DeleteButton id={event.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
