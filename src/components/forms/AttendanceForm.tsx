"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  attendanceSchema,
  AttendanceSchema,
} from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
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

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AttendanceSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    lessons: { id: string; name: string }[];
    students: { id: string; name: string; surname: string }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      id: data?.id || "",
      studentId: data?.studentId || "",
      lessonId: data?.lessonId || "",
      date: data?.date ? new Date(data.date) : new Date(),
      present: data?.present || false,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    const response = (await formAction(formData)) as unknown;

    if (
      typeof response === "object" &&
      response !== null &&
      "success" in response
    ) {
      const typedResponse = response as { success: boolean; error: boolean };

      console.log("Update Response:", typedResponse);

      if (typedResponse.success) {
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update attendance.");
      }
    }
  });

  useEffect(() => {
    if (state.success) {
      toast(
        `Attendance has been ${type === "create" ? "created" : "updated"}!`
      );
      setOpen(false);
      router.refresh();
    }
  }, [state.success, router, type, setOpen]);

  // Helper function to handle date changes safely
  const handleDateChange = (date: Date | undefined) => {
    const safeDate = date || new Date();
    setValue("date", safeDate);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Attendance" : "Update Attendance"}
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

        {/* Student Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <Controller
            control={control}
            name="studentId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Students</SelectLabel>
                    {relatedData?.students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name} {student.surname}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        {/* Lesson Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <Controller
            control={control}
            name="lessonId"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select lesson" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Lessons</SelectLabel>
                    {relatedData?.lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        {/* Date DateTimePicker */}
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateTimePicker
              label="Date"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange(date);
              }}
              error={errors.date?.message?.toString()}
            />
          )}
        />

        {/* Present Checkbox */}
        <div className="flex items-center gap-3 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Present</label>
          <input
            type="checkbox"
            {...register("present")}
            defaultChecked={data?.present}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-lg w-6 h-6"
          />
          {errors.present?.message && (
            <p className="text-xs text-red-400">
              {errors.present.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;
