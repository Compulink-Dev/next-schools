// components/forms/LessonForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Loader2,
  BookOpen,
  Calendar,
  Clock,
  Users,
  GraduationCap,
} from "lucide-react";

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data?.name || "",
      day: data?.day || "",
      subjectId: data?.subjectId || "",
      classId: data?.classId || "",
      teacherId: data?.teacherId || "",
      id: data?.id || "",
      startTime: data?.startTime ? new Date(data.startTime) : new Date(),
      endTime: data?.endTime ? new Date(data.endTime) : new Date(),
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const result =
        type === "create"
          ? await createLesson(formData)
          : await updateLesson(formData);

      if (result.success) {
        toast.success(
          `Lesson ${type === "create" ? "created" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  });

  const { subjects, classes, teachers } = relatedData;
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-cyan-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Lesson" : "Update Lesson"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Schedule a new lesson for students"
                : "Modify lesson details"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Lesson Name *</Label>
              <Input
                id="name"
                placeholder="Enter lesson name..."
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Day *</Label>
              <Controller
                control={control}
                name="day"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.day ? "border-red-500" : ""}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Days</SelectLabel>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.day && (
                <p className="text-sm text-red-500">{errors.day.message}</p>
              )}
            </div>

            <div className="space-y-2">
              {/* <Label>Start Time *</Label> */}
              <Controller
                control={control}
                name="startTime"
                render={({ field }) => (
                  <DateTimePicker
                    label="Start Time *"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.startTime?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Controller
                control={control}
                name="endTime"
                render={({ field }) => (
                  <DateTimePicker
                    label="End Time *"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.endTime?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Subject *</Label>
              <Controller
                control={control}
                name="subjectId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.subjectId ? "border-red-500" : ""}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Subjects</SelectLabel>
                        {subjects.map(
                          (subject: { id: string; name: string }) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.name}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjectId && (
                <p className="text-sm text-red-500">
                  {errors.subjectId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Class *</Label>
              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.classId ? "border-red-500" : ""}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Classes</SelectLabel>
                        {classes.map((clazz: { id: string; name: string }) => (
                          <SelectItem key={clazz.id} value={clazz.id}>
                            {clazz.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && (
                <p className="text-sm text-red-500">{errors.classId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Teacher *</Label>
              <Controller
                control={control}
                name="teacherId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.teacherId ? "border-red-500" : ""}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Teachers</SelectLabel>
                        {teachers.map(
                          (teacher: { id: string; name: string }) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.teacherId && (
                <p className="text-sm text-red-500">
                  {errors.teacherId.message}
                </p>
              )}
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-cyan-50 border-cyan-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Clock className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-cyan-800">
                    Lesson Information
                  </h4>
                  <ul className="text-xs text-cyan-700 space-y-1">
                    <li>• Lesson name should be descriptive and clear</li>
                    <li>
                      • Select the appropriate day and time for the lesson
                    </li>
                    <li>
                      • Ensure the teacher is available during the scheduled
                      time
                    </li>
                    <li>
                      • Lessons will appear in student and teacher schedules
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
              className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Lesson"
              ) : (
                "Update Lesson"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LessonForm;
