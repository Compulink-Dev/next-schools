// components/forms/AssignmentForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import { DateTimePicker } from "../DateTimePicker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Calendar, Clock } from "lucide-react";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: { lessons: { id: string; name: string }[] };
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      id: data?.id?.toString() || "",
      title: data?.title || "",
      startDate: data?.startDate ? new Date(data.startDate) : new Date(),
      dueDate: data?.dueDate
        ? new Date(data.dueDate)
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lessonId: data?.lessonId?.toString() || "",
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData: AssignmentSchema) => {
    setIsLoading(true);
    try {
      const commonPayload = {
        title: formData.title,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        lessonId: formData.lessonId,
      };

      let response;

      if (type === "create") {
        response = await createAssignment(commonPayload);
      } else {
        if (!formData.id) {
          toast.error("Missing assignment ID for update.");
          return;
        }
        response = await updateAssignment({
          ...commonPayload,
          id: formData.id,
        });
      }

      if (response?.success) {
        toast.success(
          `Assignment ${
            type === "create" ? "created" : "updated"
          } successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response?.message || "Failed to process assignment.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  });

  const { lessons = [] } = relatedData || {};

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Assignment" : "Update Assignment"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Create a new assignment for students"
                : "Modify assignment details"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                placeholder="Enter assignment title..."
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lessonId">Lesson *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("lessonId")}
                defaultValue={data?.lessonId?.toString() || ""}
              >
                <option value="" disabled>
                  Select a lesson
                </option>
                {lessons.map((lesson) => (
                  <option key={lesson.id} value={lesson.id}>
                    {lesson.name}
                  </option>
                ))}
              </select>
              {errors.lessonId && (
                <p className="text-sm text-red-500">
                  {errors.lessonId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Controller
                control={control}
                name="startDate"
                render={({ field }) => (
                  <DateTimePicker
                    label="start Date"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.startDate?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DateTimePicker
                    label="due Date"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.dueDate?.message}
                  />
                )}
              />
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-800">
                    Assignment Information
                  </h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>
                      • Start Date: When the assignment becomes available to
                      students
                    </li>
                    <li>• Due Date: When the assignment must be submitted</li>
                    <li>
                      • Students will see this assignment in their dashboard
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Assignment"
              ) : (
                "Update Assignment"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AssignmentForm;
