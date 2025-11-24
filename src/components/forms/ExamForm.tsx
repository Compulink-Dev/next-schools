// components/forms/ExamForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
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
import { Loader2, FileText, Clock, BookOpen } from "lucide-react";

type ExamFormValues = {
  id?: string;
  title: string;
  startTime: Date;
  endTime: Date;
  lessonId: string;
};

const ExamForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<ExamSchema>;
  setOpen: (open: boolean) => void;
  relatedData?: { lessons: { id: string; name: string }[] };
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      id: data?.id?.toString() || "",
      title: data?.title || "",
      startTime: data?.startTime ? new Date(data.startTime) : new Date(),
      endTime: data?.endTime
        ? new Date(data.endTime)
        : new Date(Date.now() + 2 * 60 * 60 * 1000),
      lessonId: data?.lessonId?.toString() || "",
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const payload = {
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        lessonId: formData.lessonId,
      };

      let response;
      if (type === "create") {
        response = await createExam(payload);
      } else {
        if (!formData.id) {
          toast.error("Missing exam ID for update.");
          return;
        }
        response = await updateExam({
          ...payload,
          id: formData.id,
        });
      }

      if (response?.success) {
        toast.success(
          `Exam ${type === "create" ? "created" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(response?.error || "Failed to process the exam.");
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
      <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Exam" : "Update Exam"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Schedule a new examination"
                : "Modify exam details"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Exam Title *</Label>
              <Input
                id="title"
                placeholder="Enter exam title..."
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
                  <option key={lesson.id} value={lesson.id.toString()}>
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
              <Label>Start Time *</Label>
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <DateTimePicker
                    label="Start Time"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.startTime?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>End Time *</Label>
              <Controller
                control={control}
                name="endTime"
                render={({ field }) => (
                  <DateTimePicker
                    label="End Time"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.endTime?.message}
                  />
                )}
              />
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-orange-800">
                    Exam Guidelines
                  </h4>
                  <ul className="text-xs text-orange-700 space-y-1">
                    <li>
                      • Ensure the exam duration is appropriate for the content
                    </li>
                    <li>• Start and end times should be clearly defined</li>
                    <li>
                      • Exams will be visible to students in their schedules
                    </li>
                    <li>• Make sure the lesson selection is accurate</li>
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
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Exam"
              ) : (
                "Update Exam"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ExamForm;
