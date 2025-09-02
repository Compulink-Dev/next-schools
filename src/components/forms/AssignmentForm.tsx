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

const formatDateForInput = (dateString: string) => {
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  const localISOTime = new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16); // Format: YYYY-MM-DDTHH:MM
  return localISOTime;
};

const AssignmentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons: { id: number; name: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      id: data?.id?.toString() || "",
      title: data?.title || "",
      startDate: data?.startDate ? formatDateForInput(data.startDate) : "",
      dueDate: data?.dueDate ? formatDateForInput(data.dueDate) : "",
      lessonId: data?.lessonId?.toString() || "",
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData: AssignmentSchema) => {
    try {
      const commonPayload = {
        title: formData.title,
        startDate: new Date(formData.startDate),
        dueDate: new Date(formData.dueDate),
        lessonId: parseInt(formData.lessonId),
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
          id: parseInt(formData.id),
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

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create"
          ? "Create a new assignment"
          : "Update the assignment"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Assignment ID (Hidden)"
          name="id"
          register={register}
          error={errors?.id}
          hidden
        />

        <InputField
          label="Assignment Title"
          name="title"
          register={register}
          error={errors?.title}
        />

        <InputField
          label="Start Date"
          type="datetime-local"
          name="startDate"
          register={register}
          error={errors?.startDate}
        />

        <InputField
          label="Due Date"
          type="datetime-local"
          name="dueDate"
          register={register}
          error={errors?.dueDate}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson ID</label>
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

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
