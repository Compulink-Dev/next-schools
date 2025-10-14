// components/forms/LessonForm.tsx - FIXED VERSION
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { lessonSchema, LessonSchema } from "@/lib/formValidationSchemas";
import { createLesson, updateLesson } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from "react-hook-form";
import { DateTimePicker } from "../DateTimePicker";

const LessonForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<LessonSchema>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data?.name || "",
      day: data?.day || "",
      subjectId: data?.subjectId || "",
      classId: data?.classId || "",
      teacherId: data?.teacherId || "",
      id: data?.id || "",
      startTime: data?.startTime ? new Date(data.startTime) : new Date(), // Provide default Date
      endTime: data?.endTime ? new Date(data.endTime) : new Date(), // Provide default Date
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createLesson : updateLesson,
    {
      success: false,
      error: false,
    }
  );
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    console.log("Form data being submitted:", formData);

    // Ensure dates are valid before submission
    const submissionData = {
      ...formData,
      startTime: formData.startTime || new Date(),
      endTime: formData.endTime || new Date(),
    };

    const response = (await formAction(submissionData)) as unknown;
  });

  useEffect(() => {
    console.log("📦 Form state changed:", state);
    if (state.success) {
      toast(`Lesson has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      console.error("❌ Failed to update — showing error toast");
      toast.error("Failed to update the score!");
    }
  }, [state, router, setOpen]);

  const { subjects, classes, teachers } = relatedData;
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  const isSubmitting = state === null;

  // Helper function to handle date changes safely
  const handleDateChange = (
    fieldName: "startTime" | "endTime",
    date: Date | undefined
  ) => {
    const safeDate = date || new Date(); // Provide fallback date
    setValue(fieldName, safeDate);
  };

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new lesson" : "Update the lesson"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Lesson name"
          name="name"
          register={register}
          error={errors?.name}
        />

        {/* Day Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Day</label>
          <Controller
            control={control}
            name="day"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
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
          {errors.day?.message && (
            <p className="text-xs text-red-400">
              {errors.day.message.toString()}
            </p>
          )}
        </div>

        {/* Start Time DateTimePicker */}
        <Controller
          control={control}
          name="startTime"
          render={({ field }) => (
            <DateTimePicker
              label="Start Time"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange("startTime", date);
              }}
              error={errors.startTime?.message?.toString()}
            />
          )}
        />

        {/* End Time DateTimePicker */}
        <Controller
          control={control}
          name="endTime"
          render={({ field }) => (
            <DateTimePicker
              label="End Time"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange("endTime", date);
              }}
              error={errors.endTime?.message?.toString()}
            />
          )}
        />

        {data && (
          <InputField
            label="Id"
            name="id"
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        {/* Subject Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subject</label>
          <Controller
            control={control}
            name="subjectId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Subjects</SelectLabel>
                    {subjects.map((subject: { id: string; name: string }) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.subjectId?.message && (
            <p className="text-xs text-red-400">
              {errors.subjectId.message.toString()}
            </p>
          )}
        </div>

        {/* Class Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <Controller
            control={control}
            name="classId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
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
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        {/* Teacher Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teacher</label>
          <Controller
            control={control}
            name="teacherId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Teachers</SelectLabel>
                    {teachers.map((teacher: { id: string; name: string }) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.teacherId?.message && (
            <p className="text-xs text-red-400">
              {errors.teacherId.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button
        className="bg-blue-400 text-white p-2 rounded-md disabled:opacity-50"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Submitting..."
          : type === "create"
          ? "Create"
          : "Update"}
      </button>
    </form>
  );
};

export default LessonForm;
