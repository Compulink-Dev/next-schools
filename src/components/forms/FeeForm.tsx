"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { createFee, updateFee } from "@/lib/actions";
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

const feeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0, "Amount is required"),
  dueDate: z.date({ required_error: "Due date is required" }),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  status: z.enum(["PENDING", "PAID", "PARTIAL"]).optional(),
});

export type FeeFormValues = z.infer<typeof feeSchema>;

const FeeForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<FeeFormValues>;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    classes: { id: string; name: string }[];
    students: { id: string; name: string; surname: string }[];
  };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      ...data,
      dueDate: data?.dueDate
        ? new Date(data.dueDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days later
      classId: data?.classId || undefined,
      studentId: data?.studentId || undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createFee : updateFee,
    { success: false, error: false }
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Fee has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((formData) => {
    formAction(formData as any);
  });

  // Helper function to handle date changes safely
  const handleDateChange = (date: Date | undefined) => {
    const safeDate = date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    setValue("dueDate", safeDate);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Fee" : "Update Fee"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {data?.id && (
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

        <InputField
          label="Amount"
          name="amount"
          type="number"
          register={register}
          error={errors?.amount}
        />

        {/* Due Date DateTimePicker */}
        <Controller
          control={control}
          name="dueDate"
          render={({ field }) => (
            <DateTimePicker
              label="Due Date"
              value={field.value}
              onChange={(date) => {
                field.onChange(date);
                handleDateChange(date);
              }}
              error={errors.dueDate?.message?.toString()}
            />
          )}
        />

        {/* Class Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class (optional)</label>
          <Controller
            control={control}
            name="classId"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || "none"}
                defaultValue={data?.classId || "none"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Classes</SelectLabel>
                    <SelectItem value="none">None</SelectItem>
                    {relatedData?.classes?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Student Select */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student (optional)</label>
          <Controller
            control={control}
            name="studentId"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value || "none"}
                defaultValue={data?.studentId || "none"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Students</SelectLabel>
                    <SelectItem value="none">None</SelectItem>
                    {relatedData?.students?.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} {s.surname}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          Fee Information
        </h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • Amount should be in the smallest currency unit (e.g., cents)
          </li>
          <li>• Due date is when the fee payment is expected</li>
          <li>• You can assign fees to specific classes or students</li>
        </ul>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button
        className="bg-blue-400 hover:bg-blue-500 text-white p-2 rounded-md w-full mt-4 transition-colors"
        type="submit"
      >
        {type === "create" ? "Create Fee" : "Update Fee"}
      </button>
    </form>
  );
};

export default FeeForm;
