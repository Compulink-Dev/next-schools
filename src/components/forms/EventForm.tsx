"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { eventSchema, EventSchema } from "@/lib/formValidationSchemas";
import { createEvent, updateEvent } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: { classes: { id: string; name: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      id: data?.id || "",
      title: data?.title || "",
      description: data?.description || "",
      startTime: data?.startTime ? new Date(data.startTime) : new Date(),
      endTime: data?.endTime
        ? new Date(data.endTime)
        : new Date(Date.now() + 2 * 60 * 60 * 1000), // Default 2 hours later
      classId: data?.classId || "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  console.log("state", state);

  // Helper functions to handle date changes safely
  const handleStartTimeChange = (date: Date | undefined) => {
    const safeDate = date || new Date();
    setValue("startTime", safeDate);

    // If end time is before start time, adjust end time
    const currentEndTime = new Date(safeDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
    setValue("endTime", currentEndTime);
  };

  const handleEndTimeChange = (date: Date | undefined) => {
    const safeDate = date || new Date(Date.now() + 2 * 60 * 60 * 1000);
    setValue("endTime", safeDate);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Event" : "Update Event"}
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
                handleStartTimeChange(date);
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
                handleEndTimeChange(date);
              }}
              error={errors.endTime?.message?.toString()}
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
                value={field.value || undefined}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    {relatedData?.classes.map((cls) => (
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
            placeholder="Enter event details..."
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
          Event Information
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Events can be assigned to specific classes or all classes</li>
          <li>• Start and end times define the event duration</li>
          <li>• Events will appear in the calendar view</li>
          <li>• Use clear descriptions to explain the event purpose</li>
        </ul>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-md w-full mt-4 transition-colors">
        {type === "create" ? "Create Event" : "Update Event"}
      </button>
    </form>
  );
};

export default EventForm;
