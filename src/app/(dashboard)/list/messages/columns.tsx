//@ts-nocheck
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Message } from "@prisma/client";
import { Eye, Mail, MailOpen } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type MessageList = Message;

export const columns: ColumnDef<MessageList>[] = [
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
        {row.original.read ? (
          <MailOpen size={16} className="text-gray-400" />
        ) : (
          <Mail size={16} className="text-blue-500" />
        )}
        <span className={row.original.read ? "text-gray-600" : "font-semibold"}>
          {row.original.title}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "content",
    header: "Content",
    cell: ({ row }) => (
      <div className="max-w-xs truncate" title={row.original.content}>
        {row.original.content}
      </div>
    ),
  },
  {
    accessorKey: "sender",
    header: "Sender",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium capitalize">{row.original.senderType}</div>
        <div className="text-xs text-gray-500 truncate max-w-[120px]">
          {row.original.senderId}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "receiver",
    header: "Receiver",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium capitalize">
          {row.original.receiverType}
        </div>
        <div className="text-xs text-gray-500 truncate max-w-[120px]">
          {row.original.receiverId}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Sent",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(row.original.createdAt)}
        </div>
        <div className="text-xs text-gray-500">
          {new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }).format(row.original.createdAt)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.read
            ? "bg-gray-100 text-gray-800"
            : "bg-blue-100 text-blue-800"
        }`}
      >
        {row.original.read ? "Read" : "Unread"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const message = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/messages/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete message");
          }

          toast("Message deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete message");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/messages/${message.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={message.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
