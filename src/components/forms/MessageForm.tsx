"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import { createMessage, updateMessage } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type MessageFormProps = {
  type: "create" | "update";
  data?: MessageSchema;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    teachers: { id: string; name: string; surname: string }[];
    students: { id: string; name: string; surname: string }[];
  };
};

const MessageForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: MessageFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MessageSchema>({
    resolver: zodResolver(messageSchema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createMessage : updateMessage,
    { success: false, error: false }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Message has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = (formData: MessageSchema) => {
    // Define onSubmit function
    formAction(formData);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Message" : "Update Message"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={String(data?.id)}
            register={register}
            error={errors?.id}
            hidden
          />
        )}

        <InputField
          label="Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <InputField
          label="Content"
          name="content"
          defaultValue={data?.content}
          register={register}
          error={errors?.content}
        />

        <InputField
          label="Sender ID"
          name="senderId"
          defaultValue={data?.senderId}
          register={register}
          error={errors?.senderId}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sender Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("senderType")}
            defaultValue={data?.senderType}
          >
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.senderType?.message && (
            <p className="text-xs text-red-400">
              {errors.senderType.message.toString()}
            </p>
          )}
        </div>

        <InputField
          label="Receiver ID"
          name="receiverId"
          defaultValue={data?.receiverId}
          register={register}
          error={errors?.receiverId}
        />

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Receiver Type</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("receiverType")}
            defaultValue={data?.receiverType}
          >
            <option value="TEACHER">Teacher</option>
            <option value="STUDENT">Student</option>
            <option value="ADMIN">Admin</option>
          </select>
          {errors.receiverType?.message && (
            <p className="text-xs text-red-400">
              {errors.receiverType.message.toString()}
            </p>
          )}
        </div>
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button
        className="bg-blue-400 text-white p-2 rounded-md w-full mt-4"
        type="submit"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default MessageForm;
