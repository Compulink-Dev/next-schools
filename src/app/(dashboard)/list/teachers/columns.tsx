// app/list/teachers/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Teacher,
  Subject,
  Class,
  TeacherSubject,
  TeacherClass,
} from "@prisma/client";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";

export type TeacherWithRelations = Teacher & {
  subjects: (TeacherSubject & { subject: Subject })[];
  classes: (TeacherClass & { class: Class })[];
};

export const columns: ColumnDef<TeacherWithRelations>[] = [
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
    accessorKey: "info",
    header: "Info",
    cell: ({ row }) => {
      const teacher = row.original;
      return (
        <div className="flex items-center gap-4">
          <Image
            src={teacher.img || "/noAvatar.png"}
            alt={teacher.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <h3 className="font-semibold">{teacher.name}</h3>
            <p className="text-xs text-gray-500">{teacher.email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "teacherId",
    header: "ID",
    cell: ({ row }) => row.original.username,
  },
  {
    accessorKey: "subjects",
    header: "Subjects",
    cell: ({ row }) =>
      row.original.subjects.map((s) => s.subject.name).join(", "),
  },
  {
    accessorKey: "classes",
    header: "Classes",
    cell: ({ row }) => row.original.classes.map((c) => c.class.name).join(", "),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const teacher = row.original;
      const handleDelete = async (id: string) => {
        // Call your API to delete the teacher
        try {
          const response = await fetch(`/api/teachers/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete teacher");
          }

          // Refresh the page or update the data
          toast("Teacher deleted successufully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/teachers/${teacher.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <DeleteButton id={teacher.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
