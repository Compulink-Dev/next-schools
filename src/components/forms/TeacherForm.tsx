"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { X } from "lucide-react";

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      subjects:
        data?.subjects?.map((subject: any) => subject.id.toString()) || [],
    },
  });

  const [img, setImg] = useState<any>(data?.img || null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    data?.subjects?.map((subject: any) => subject.id.toString()) || []
  );
  const [widgetOpen, setWidgetOpen] = useState(false);

  const [state, formAction] = useFormState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction({ ...data, img: img?.secure_url || img });
  });

  const router = useRouter();

  useEffect(() => {
    try {
      if (state.success) {
        toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      }
    } catch (error) {
      toast(`Error in creating teacher : ${error}`);
    }
  }, [state, router, type, setOpen]);

  const { subjects } = relatedData;

  const handleSubjectChange = (value: string) => {
    const newSelectedSubjects = selectedSubjects.includes(value)
      ? selectedSubjects.filter((subject) => subject !== value)
      : [...selectedSubjects, value];

    setSelectedSubjects(newSelectedSubjects);
    setValue("subjects", newSelectedSubjects);
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Blood Type"
          name="bloodType"
          defaultValue={data?.bloodType}
          register={register}
          error={errors.bloodType}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday?.toISOString().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <Label className="text-xs text-gray-500">Sex</Label>
          <Controller
            name="sex"
            control={control}
            defaultValue={data?.sex ?? ""}
            rules={{ required: "Sex is required!" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Gender</SelectLabel>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />

          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects</label>
          <Controller
            name="subjects"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={handleSubjectChange}
                value={selectedSubjects.join(",")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Subjects</SelectLabel>
                    {subjects.map((subject: { id: number; name: string }) => (
                      <SelectItem
                        key={subject.id}
                        value={String(subject.id)}
                        className={
                          selectedSubjects.includes(String(subject.id))
                            ? "bg-gray-100"
                            : ""
                        }
                      >
                        {subject.name}
                        {selectedSubjects.includes(String(subject.id)) && " ✓"}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />

          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>

        {/* Cloudinary Upload Section */}
        <div className="flex flex-col gap-2">
          <div
            className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
            onClick={() => setWidgetOpen(true)}
          >
            <Image src="/upload.png" alt="" width={28} height={28} />
            <span>Upload a photo</span>
          </div>

          {img && (
            <div className="mt-2">
              <Image
                src={typeof img === "string" ? img : img.secure_url}
                alt="Preview"
                width={80}
                height={80}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Cloudinary Widget Modal */}
      {widgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white p-6 rounded-lg max-w-md w-full">
            <button
              onClick={() => setWidgetOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium mb-4">Upload Image</h3>

            {/* Simple Cloudinary Widget that opens automatically */}
            <CldUploadWidget
              uploadPreset="school"
              onSuccess={(result, { widget }) => {
                setImg(result.info);
                widget.close();
                setWidgetOpen(false);
              }}
              onClose={() => {
                setWidgetOpen(false);
              }}
            >
              {({ open }) => {
                // Use a timeout to ensure the widget is ready before opening
                setTimeout(() => {
                  open();
                }, 100);

                return (
                  <div className="text-center p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      Cloudinary upload widget is loading...
                    </p>
                    <Button
                      type="button"
                      onClick={() => open()}
                      className="bg-blue-500 text-white"
                    >
                      Open Upload Widget
                    </Button>
                  </div>
                );
              }}
            </CldUploadWidget>
          </div>
        </div>
      )}

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <Button className="bg-blue-400 text-white rounded-md">
        {type === "create" ? "Create" : "Update"}
      </Button>
    </form>
  );
};

export default TeacherForm;
