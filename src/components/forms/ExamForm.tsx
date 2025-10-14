"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { DateTimePicker } from "../DateTimePicker";

// Form input types
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
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { lessons: { id: string; name: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      id: data?.id?.toString() || "",
      title: data?.title || "",
      startTime: data?.startTime ? new Date(data.startTime) : new Date(),
      endTime: data?.endTime
        ? new Date(data.endTime)
        : new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours later
      lessonId: data?.lessonId?.toString() || "",
    },
  });

  const router = useRouter();

  useEffect(() => {
    console.log("🧾 Form mounted for:", type);
  }, [type]);

  const onSubmit = handleSubmit(
    async (formData) => {
      console.log("📤 Form submitted with values:", formData);

      try {
        const payload = {
          title: formData.title,
          startTime: formData.startTime,
          endTime: formData.endTime,
          lessonId: formData.lessonId,
        };

        let response;
        if (type === "create") {
          console.log("📦 Sending create request with payload:", payload);
          response = await createExam(payload);
        } else {
          if (!formData.id) {
            toast.error("Missing exam ID for update.");
            console.error("❌ No ID provided in formData.");
            return;
          }
          const updatePayload = { ...payload, id: formData.id };
          console.log("🛠️ Sending update request with payload:", updatePayload);
          response = await updateExam(updatePayload);
        }

        console.log("✅ Received response from server:", response);

        if (response?.success) {
          toast(
            `Exam ${type === "create" ? "created" : "updated"} successfully!`
          );
          setOpen(false);
          router.refresh();
        } else {
          toast.error("Failed to process the exam.");
          console.warn("⚠️ Operation failed with response:", response);
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
        console.error("🔥 Uncaught error in exam form submission:", error);
      }
    },
    (formErrors) => {
      console.error(
        "❌ Validation blocked form submission. Errors:",
        formErrors
      );
      toast.error("Please correct the highlighted form errors.");
    }
  );

  const { lessons = [] } = relatedData || {};

  // Helper function to handle date changes safely
  const handleDateChange = (
    fieldName: "startTime" | "endTime",
    date: Date | undefined
  ) => {
    const safeDate = date || new Date();
    setValue(fieldName, safeDate);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new exam" : "Update the exam"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Exam title"
          name="title"
          register={register}
          error={errors.title}
        />

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
            label="ID (hidden)"
            name="id"
            register={register}
            error={errors.id}
            hidden
          />
        )}

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
              <option key={lesson.id} value={lesson.id.toString()}>
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

export default ExamForm;
