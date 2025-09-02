"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { examSchema, ExamSchema } from "@/lib/formValidationSchemas";
import { createExam, updateExam } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Form input types (strings only)
type ExamFormValues = {
  id?: string;
  title: string;
  startTime: string;
  endTime: string;
  lessonId: string;
};

const formatDateForInput = (dateString: any) => {
  const date = new Date(dateString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
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
  relatedData?: { lessons: { id: number; name: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      id: data?.id?.toString() || "",
      title: data?.title || "",
      startTime: data?.startTime ? formatDateForInput(data.startTime) : "",
      endTime: data?.endTime ? formatDateForInput(data.endTime) : "",
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
          startTime: new Date(formData.startTime),
          endTime: new Date(formData.endTime),
          lessonId: parseInt(formData.lessonId),
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
          const updatePayload = { ...payload, id: parseInt(formData.id) };
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

        <InputField
          label="Start Date"
          name="startTime"
          type="datetime-local"
          register={register}
          error={errors.startTime}
        />

        <InputField
          label="End Date"
          name="endTime"
          type="datetime-local"
          register={register}
          error={errors.endTime}
        />

        <InputField
          label="ID (hidden)"
          name="id"
          register={register}
          error={errors.id}
          hidden
        />

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
