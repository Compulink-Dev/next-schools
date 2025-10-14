"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import { DateTimePicker } from "../DateTimePicker";

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons: { id: string; name: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
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

      if (response && response.success) {
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
      console.error("Assignment form error:", error);
    }
  });

  const { lessons = [] } = relatedData || {};

  // Helper function to handle date changes safely
  const handleDateChange = (
    fieldName: "startDate" | "dueDate",
    date: Date | undefined
  ) => {
    const safeDate = date || new Date();
    setValue(fieldName, safeDate);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new assignment"
          : "Update the assignment"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {data && (
          <InputField
            label="Assignment ID (Hidden)"
            name="id"
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <InputField
          label="Assignment Title"
          name="title"
          register={register}
          error={errors?.title}
        />

        {/* Start Date DateTimePicker */}
        <Controller
          control={control}
          name="startDate"
          render={({ field }) => (
            <DateTimePicker
              label="Start Date"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange("startDate", date);
              }}
              error={errors.startDate?.message?.toString()}
            />
          )}
        />

        {/* Due Date DateTimePicker */}
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DateTimePicker
              label="Due Date"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange("dueDate", date);
              }}
              error={errors.dueDate?.message?.toString()}
            />
          )}
        />

        {/* Simple Lesson Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
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
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Assignment Information
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • Start Date: When the assignment becomes available to students
          </li>
          <li>• Due Date: When the assignment must be submitted</li>
          <li>• Students will see this assignment in their dashboard</li>
        </ul>
      </div>

      <button className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-md transition-colors">
        {type === "create" ? "Create Assignment" : "Update Assignment"}
      </button>
    </form>
  );
};

export default AssignmentForm;
