"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { updateResult } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const ResultForm = ({
  type,
  data,
  setOpen,
}: {
  type: "create" | "update";
  data: {
    id: number;
    title: string;
    studentName: string;
    studentSurname: string;
    teacherName: string;
    teacherSurname: string;
    score: number;
    className: string;
    startTime: string;
  };
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  if (type === "create") {
    console.warn("⚠️ Tried to render ResultForm in 'create' mode.");
    return <div>Not allowed</div>;
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      score: data.score,
      studentId: data.id.toString(),
    },
  });

  const [state, formAction] = useFormState(updateResult, {
    success: false,
    error: false,
  });

  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    const payload = {
      id: data.id,
      score: formData.score,
      studentId: data.id.toString(),
    };

    const response = (await formAction(payload)) as unknown;
  });

  useEffect(() => {
    console.log("📦 Form state changed:", state);

    if (state.success) {
      console.log("✅ Success: Toasting & closing modal");
      toast("Score has been updated!");
      setOpen(false);
      router.refresh();
    } else if (state.error) {
      console.error("❌ Failed to update — showing error toast");
      toast.error("Failed to update the score!");
    }
  }, [state, router, setOpen, data.id]);

  return (
    <form
      ref={formRef}
      className="flex flex-col gap-8"
      onSubmit={(e) => {
        e.preventDefault(); // 🔒 prevent page reload
        onSubmit(); // ✅ call handler
      }}
    >
      <h1 className="text-xl font-semibold">Update Result</h1>

      <div className="flex gap-4">
        <div className="flex-1">
          <div>
            <label>
              <strong>Student Name: </strong>
            </label>
            <span>{data.studentName}</span>
          </div>
          <div>
            <label>
              <strong>Score: </strong>
            </label>
            <InputField
              label=""
              type="number"
              name="score"
              defaultValue={data.score.toString()}
              register={register}
              error={errors?.score}
            />
          </div>
        </div>

        <div className="flex-1">
          <div>
            <label>
              <strong>Exam Title: </strong>
            </label>
            <span>{data.title}</span>
          </div>
          <div>
            <label>
              <strong>Student Surname: </strong>
            </label>
            <span>{data.studentSurname}</span>
          </div>
          <div>
            <label>
              <strong>Teacher Name: </strong>
            </label>
            <span>{data.teacherName}</span>
          </div>
          <div>
            <label>
              <strong>Teacher Surname: </strong>
            </label>
            <span>{data.teacherSurname}</span>
          </div>
          <div>
            <label>
              <strong>Class Name: </strong>
            </label>
            <span>{data.className}</span>
          </div>
          <div>
            <label>
              <strong>Start Time: </strong>
            </label>
            <span>{new Date(data.startTime).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md w-full mt-4">
        Update Score
      </button>
    </form>
  );
};

export default ResultForm;
