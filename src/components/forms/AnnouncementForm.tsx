"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
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

type AnnouncementFormProps = {
  type: "create" | "update";
  data?: AnnouncementSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { classes: { id: string; name: string }[] };
};

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: AnnouncementFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: data?.id || "",
      title: data?.title || "",
      description: data?.description || "",
      date: data?.date ? new Date(data.date) : new Date(),
      classId: data?.classId || "all",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    // Transform "all" back to empty string for the server
    const submissionData = {
      ...formData,
      classId: formData.classId === "all" ? "" : formData.classId,
    };
    formAction(submissionData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(
        `Announcement has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Helper function to handle date changes safely
  const handleDateChange = (date: Date | undefined) => {
    const safeDate = date || new Date();
    setValue("date", safeDate);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Announcement" : "Update Announcement"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {data && (
          <InputField
            label="Id"
            name="id"
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <InputField
          label="Title"
          name="title"
          register={register}
          error={errors?.title}
        />

        {/* Date DateTimePicker */}
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateTimePicker
              label="Announcement Date"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange(date);
              }}
              error={errors.date?.message?.toString()}
            />
          )}
        />

        {/* Class Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <Controller
            control={control}
            name="classId"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={data?.classId || "all"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    <SelectItem value="all">All Classes</SelectItem>
                    {relatedData?.classes?.map((cls) => (
                      <SelectItem value={cls.id} key={cls.id}>
                        {cls.name}
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

        {/* Description */}
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[100px]"
            {...register("description")}
            defaultValue={data?.description}
            placeholder="Enter announcement details..."
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">
              {errors.description.message.toString()}
            </p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Announcement Information
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • Announcements will be visible to selected classes or all classes
          </li>
          <li>• Date determines when the announcement will be published</li>
          <li>• Use clear and concise titles for better visibility</li>
        </ul>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-md w-full mt-4 transition-colors">
        {type === "create" ? "Create Announcement" : "Update Announcement"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
