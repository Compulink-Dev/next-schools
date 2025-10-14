// components/forms/GradeForm.tsx - FIXED VERSION
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createGrade, updateGrade } from "@/lib/actions";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { gradeSchema, GradeSchema } from "../../../lib/formValidationSchemas";

const GradeForm = ({
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
    formState: { errors, isSubmitting },
  } = useForm<GradeSchema>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      level: data?.level ? String(data.level) : "",
      description: data?.description || "",
      id: data?.id || "",
    },
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("level", formData.level);
      if (formData.description) {
        formDataObj.append("description", formData.description);
      }
      if (formData.id) {
        formDataObj.append("id", formData.id);
      }

      let result;
      if (type === "create") {
        // Pass both prevState and formData
        result = await createGrade(
          { success: false, error: false },
          formDataObj
        );
      } else {
        // Pass both prevState and formData
        result = await updateGrade(
          { success: false, error: false },
          formDataObj
        );
      }

      if (result.success) {
        toast.success(
          `Grade has been ${type === "create" ? "created" : "updated"}!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Failed to process your request");
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new grade" : "Update the grade"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Grade Level"
          name="level"
          type="number"
          register={register}
          error={errors?.level}
        />

        <InputField
          label="Description (Optional)"
          name="description"
          register={register}
          error={errors?.description}
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
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Grade Information
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Grade level must be a unique positive number</li>
          <li>• Description is optional but recommended</li>
          <li>• Once created, classes can be assigned to this grade</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={loading || isSubmitting}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white p-3 rounded-md font-medium transition-colors"
      >
        {loading || isSubmitting
          ? "Processing..."
          : type === "create"
          ? "Create Grade"
          : "Update Grade"}
      </button>
    </form>
  );
};

export default GradeForm;
