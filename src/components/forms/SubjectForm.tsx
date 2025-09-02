"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Client-safe values: strings from inputs
type SubjectFormValues = {
  id?: string;
  name: string;
  teachers: string[]; // will be converted to number[]
};

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<SubjectSchema>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { teachers: { id: number; name: string; surname: string }[] };
}) => {
  const router = useRouter();

  useEffect(() => {
    console.log("🧾 SubjectForm mounted with type:", type);
    console.log("🔄 Initial form data:", data);
  }, [type, data]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id?.toString() || "",
      name: data?.name || "",
      teachers: data?.teachers?.map((t: any) => t.id.toString()) || [],
    },
  });

  const onSubmit = handleSubmit(async (formData) => {
    console.log("🖱️ Submit triggered");
    console.log("📤 Form values before payload:", formData);

    try {
      const payload = {
        name: formData.name,
        teachers: formData.teachers, // Now string[], not parsed to numbers
      };

      let response;

      if (type === "create") {
        console.log("📦 Creating subject with payload:", payload);
        response = await createSubject(payload);
      } else {
        if (!formData.id) {
          toast.error("Missing subject ID for update.");
          console.error("❌ No ID provided in formData.");
          return;
        }

        const fullPayload = { ...payload, id: parseInt(formData.id) };
        console.log(
          "🛠️ Sending update request with full payload:",
          fullPayload
        );
        response = await updateSubject(fullPayload);
      }

      console.log("✅ Server response received:", response);

      if (response?.success) {
        toast.success(
          `Subject ${type === "create" ? "created" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to process the subject.");
        console.warn("⚠️ Operation failed with response:", response);
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error("🔥 Uncaught error in subject form submission:", error);
    }
  });

  const { teachers = [] } = relatedData || {};

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        console.log("🖱️ Submit triggered");
        e.preventDefault();
        onSubmit();
        console.log("📛 Validation errors (if any):", errors);
      }}
    >
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          name="name"
          register={register}
          error={errors.name}
        />

        <InputField
          label="ID (hidden)"
          name="id"
          register={register}
          error={errors.id}
          hidden
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teachers</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("teachers")}
          >
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id.toString()}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          {errors.teachers?.message && (
            <p className="text-xs text-red-400">
              {errors.teachers.message.toString()}
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

export default SubjectForm;
