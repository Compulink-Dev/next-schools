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

const formatDateForInput = (dateString: any) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:MM
};

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: AttendanceSchema; // Specify type for data
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    lessons: { id: number; name: string }[];
    students: { id: string; name: string; surname: string }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
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
    const response = (await formAction(formData)) as unknown; // Type as unknown first

    // Type guard to check if response is an object
    if (
      typeof response === "object" &&
      response !== null &&
      "success" in response
    ) {
      const typedResponse = response as { success: boolean; error: boolean }; // Cast to expected type

      console.log("Update Response:", typedResponse); // Log for debugging

      if (typedResponse.success) {
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update attendance."); // Show error toast
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
            defaultValue={data?.id !== undefined ? String(data.id) : ""} // Convert to string
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("studentId")}
            defaultValue={data?.studentId}
          >
            {relatedData?.students.map((student) => (
              <option value={student.id} key={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Lesson</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("lessonId")}
            defaultValue={data?.lessonId}
          >
            {relatedData?.lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
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

        <InputField
          label="Date"
          type="datetime-local"
          name="date"
          defaultValue={data?.date ? formatDateForInput(data.date) : ""}
          register={register}
          error={errors?.date}
        />

        <div className="flex items-center gap-2">
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
