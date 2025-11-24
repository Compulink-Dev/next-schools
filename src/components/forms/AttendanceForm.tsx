// components/forms/AttendanceForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import {
  attendanceSchema,
  AttendanceSchema,
} from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import { DateTimePicker } from "../DateTimePicker";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Calendar,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface RelatedData {
  lessons: { id: string; name: string }[];
  students: { id: string; name: string; surname: string; className?: string }[];
}

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: RelatedData;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      id: data?.id || "",
      studentId: data?.studentId || "",
      lessonId: data?.lessonId || "",
      date: data?.date ? new Date(data.date) : new Date(),
      present: data?.present || false,
    },
  });

  const router = useRouter();

  // Reset form when data changes
  useEffect(() => {
    if (data) {
      reset({
        id: data.id || "",
        studentId: data.studentId || "",
        lessonId: data.lessonId || "",
        date: data.date ? new Date(data.date) : new Date(),
        present: data.present || false,
      });
    }
  }, [data, reset]);

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const result =
        type === "create"
          ? await createAttendance(formData)
          : await updateAttendance(formData);

      if (result.success) {
        toast.success(
          `Attendance ${
            type === "create" ? "created" : "updated"
          } successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to process attendance.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  });

  // Check if we have the necessary related data
  if (
    type === "create" &&
    (!relatedData?.students?.length || !relatedData?.lessons?.length)
  ) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unable to Load Form
          </h3>
          <p className="text-gray-600 mb-4">
            {!relatedData?.students?.length && !relatedData?.lessons?.length
              ? "No students or lessons available."
              : !relatedData?.students?.length
              ? "No students available for attendance."
              : "No lessons available for attendance."}
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Record Attendance" : "Update Attendance"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Mark student attendance for a lesson"
                : "Update attendance record"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Student *</Label>
              <Controller
                control={control}
                name="studentId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={type === "update"} // Disable student selection for updates
                  >
                    <SelectTrigger
                      className={errors.studentId ? "border-red-500" : ""}
                    >
                      <User className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>
                          Students ({relatedData?.students?.length || 0})
                        </SelectLabel>
                        {relatedData?.students?.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} {student.surname}
                            {student.className && ` (${student.className})`}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.studentId && (
                <p className="text-sm text-red-500">
                  {errors.studentId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Lesson *</Label>
              <Controller
                control={control}
                name="lessonId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={type === "update"} // Disable lesson selection for updates
                  >
                    <SelectTrigger
                      className={errors.lessonId ? "border-red-500" : ""}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select lesson" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>
                          Lessons ({relatedData?.lessons?.length || 0})
                        </SelectLabel>
                        {relatedData?.lessons?.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.lessonId && (
                <p className="text-sm text-red-500">
                  {errors.lessonId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Date *</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DateTimePicker
                    label="Date"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.date?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Attendance Status</Label>
              <div className="flex items-center gap-3 p-2">
                <Controller
                  control={control}
                  name="present"
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <div className="flex items-center gap-2">
                        {field.value ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium text-green-700">
                              Present
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm font-medium text-red-700">
                              Absent
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>
              {errors.present && (
                <p className="text-sm text-red-500">{errors.present.message}</p>
              )}
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Recording..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Record Attendance"
              ) : (
                "Update Attendance"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AttendanceForm;
