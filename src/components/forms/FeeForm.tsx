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

const feeSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0, "Amount is required"),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  classId: z.union([z.string().min(1), z.literal("")]).optional().transform(v => v === "" ? undefined : v),
  studentId: z.union([z.string().min(1), z.literal("")]).optional().transform(v => v === "" ? undefined : v),
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
  relatedData?: { classes: { id: string; name: string }[]; students: { id: string; name: string; surname: string }[] };
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(type === "create" ? createFee : updateFee, { success: false, error: false });
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

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type === "create" ? "Create Fee" : "Update Fee"}</h1>

      <div className="flex justify-between flex-wrap gap-4">
        {data?.id && (
          <InputField label="Id" name="id" defaultValue={String(data.id)} register={register} error={errors?.id} hidden />
        )}

        <InputField label="Title" name="title" defaultValue={data?.title} register={register} error={errors?.title} />
        <InputField label="Amount" name="amount" type="number" defaultValue={String(data?.amount ?? "")} register={register} error={errors?.amount} />
        <InputField label="Due Date" name="dueDate" type="datetime-local" register={register} error={errors?.dueDate} />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class (optional)</label>
          <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("classId")} defaultValue={(data?.classId as string) || ""}>
            <option value="">None</option>
            {relatedData?.classes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Student (optional)</label>
          <select className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full" {...register("studentId")} defaultValue={(data?.studentId as string) || ""}>
            <option value="">None</option>
            {relatedData?.students?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} {s.surname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error && <span className="text-red-500">Something went wrong!</span>}
      <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4" type="submit">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default FeeForm;
