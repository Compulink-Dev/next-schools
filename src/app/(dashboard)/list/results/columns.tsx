"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Result,
  Exam,
  Assignment,
  Student,
  Teacher,
  Class,
} from "@prisma/client";
import { Eye, Award, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import { toast } from "sonner";
import FormContainer from "@/components/FormContainer";

export type ResultWithRelations = Result & {
  student: Student;
  exam?:
    | (Exam & {
        lesson: {
          class: Class;
          teacher: Teacher;
        };
      })
    | null;
  assignment?:
    | (Assignment & {
        lesson: {
          class: Class;
          teacher: Teacher;
        };
      })
    | null;
};

export type ResultList = {
  id: string;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score: number;
  maxScore?: number;
  className: string;
  startTime: Date;
  type: "exam" | "assignment";
  percentage?: number;
  grade?: string;
};

export const columns: ColumnDef<ResultList>[] = [
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
    header: "Assessment",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.type === "exam" ? (
          <Award size={16} className="text-blue-500" />
        ) : (
          <TrendingUp size={16} className="text-green-500" />
        )}
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-gray-500 capitalize">
            {row.original.type}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "student",
    header: "Student",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="font-semibold text-purple-800 text-xs">
            {row.original.studentName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium">
            {row.original.studentName} {row.original.studentSurname}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ row }) => {
      const result = row.original;
      const percentage =
        result.percentage ||
        (result.maxScore ? (result.score / result.maxScore) * 100 : 0);

      let scoreColor = "text-gray-600";
      if (percentage >= 80) scoreColor = "text-green-600";
      else if (percentage >= 60) scoreColor = "text-yellow-600";
      else scoreColor = "text-red-600";

      return (
        <div className="text-center">
          <div className={`font-bold text-lg ${scoreColor}`}>
            {result.score}
            {result.maxScore && ` / ${result.maxScore}`}
          </div>
          {result.maxScore && (
            <div className="text-xs text-gray-500">
              {percentage.toFixed(1)}%
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "grade",
    header: "Grade",
    cell: ({ row }) => {
      const grade = row.original.grade;
      let gradeColor = "bg-gray-100 text-gray-800";

      if (grade === "A" || grade === "A+")
        gradeColor = "bg-green-100 text-green-800";
      else if (grade === "B" || grade === "B+")
        gradeColor = "bg-blue-100 text-blue-800";
      else if (grade === "C" || grade === "C+")
        gradeColor = "bg-yellow-100 text-yellow-800";
      else if (grade === "D" || grade === "D+")
        gradeColor = "bg-orange-100 text-orange-800";
      else if (grade === "F") gradeColor = "bg-red-100 text-red-800";

      return grade ? (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${gradeColor}`}
        >
          {grade}
        </span>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">
          {row.original.teacherName} {row.original.teacherSurname}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "class",
    header: "Class",
    cell: ({ row }) => row.original.className,
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-sm">
        <div className="font-medium">
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
          }).format(row.original.startTime)}
        </div>
        <div className="text-xs text-gray-500">
          {new Intl.DateTimeFormat("en-US", {
            year: "numeric",
          }).format(row.original.startTime)}
        </div>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const result = row.original;

      const handleDelete = async (id: string) => {
        try {
          const response = await fetch(`/api/results/${id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Failed to delete result");
          }

          toast("Result deleted successfully");
          window.location.reload();
        } catch (error) {
          console.error("Delete error:", error);
          toast.error("Failed to delete result");
        }
      };

      return (
        <div className="flex items-center gap-2">
          <Link href={`/list/results/${result.id}`}>
            <Button size="icon" variant="outline" className="w-7 h-7">
              <Eye size={16} />
            </Button>
          </Link>
          <FormContainer table="result" type="update" data={result} />
          <DeleteButton id={result.id} onDelete={handleDelete} />
        </div>
      );
    },
  },
];
