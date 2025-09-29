"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
import { Dispatch, SetStateAction, useEffect } from "react";
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

// Client-safe values: strings from inputs
type SubjectFormValues = {
  id?: string;
  name: string;
  teachers: string[];
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
    control,
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
      // Prepare the payload according to SubjectSchema
      const payload = {
        name: formData.name,
        teachers: formData.teachers, // Keep as strings
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

        // For update, include the ID as a number (convert from string)
        const fullPayload = {
          ...payload,
          id: formData.id, // Convert string ID to number
        };

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
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error("🔥 Uncaught error in subject form submission:", error);
    }
  });

  console.log("SubjectForm received relatedData:", relatedData);
  const { teachers = [] } = relatedData || {};
  console.log("Teachers : ", teachers);

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
          <label className="text-xs text-gray-500">Teacher</label>

          <Controller
            control={control}
            name="teachers"
            render={({ field }) => (
              <Select
                value={field.value?.[0] || ""}
                onValueChange={(val) => field.onChange([val])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Teachers</SelectLabel>
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher.id}
                        value={teacher.id.toString()}
                      >
                        {teacher.name} {teacher.surname}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />

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
