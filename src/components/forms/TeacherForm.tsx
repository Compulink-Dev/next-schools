"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  User,
  GraduationCap,
  BookOpen,
  Calendar,
  Droplets,
  Phone,
  MapPin,
  Upload,
  Shield,
  X,
} from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

const TeacherForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [img, setImg] = useState<any>(data?.img || null);
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    data?.subjects?.map((subject: any) => subject.id.toString()) || []
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      username: data?.username || "",
      email: data?.email || "",
      password: data?.password || "",
      name: data?.name || "",
      surname: data?.surname || "",
      phone: data?.phone || "",
      address: data?.address || "",
      bloodType: data?.bloodType || "",
      birthday: data?.birthday ? data.birthday.toISOString().split("T")[0] : "",
      id: data?.id || "",
      sex: data?.sex || "MALE",
      subjects:
        data?.subjects?.map((subject: any) => subject.id.toString()) || [],
    },
  });

  const router = useRouter();
  const subjects = relatedData?.subjects || [];

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        img: img?.secure_url || img || data?.img,
      };

      const result =
        type === "create"
          ? await createTeacher(submissionData)
          : await updateTeacher(submissionData);

      if (result.success) {
        toast.success(
          `Teacher ${type === "create" ? "created" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  });

  const handleSubjectChange = (value: string) => {
    const newSelectedSubjects = selectedSubjects.includes(value)
      ? selectedSubjects.filter((subject) => subject !== value)
      : [...selectedSubjects, value];

    setSelectedSubjects(newSelectedSubjects);
    setValue("subjects", newSelectedSubjects);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Teacher" : "Update Teacher"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Add a new teacher to the faculty"
                : "Modify teacher information"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Authentication Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-900">
                Authentication Information
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  placeholder="Enter username..."
                  {...register("username")}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-sm text-red-500">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email..."
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  Password {type === "create" ? "*" : ""}
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password..."
                  {...register("password")}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-medium text-purple-900">
                Personal Information
              </h3>
            </div>

            {/* Profile Photo Upload */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {img && (
                    <div className="relative">
                      <Image
                        src={typeof img === "string" ? img : img.secure_url}
                        alt="Profile preview"
                        width={80}
                        height={80}
                        className="rounded-full object-cover border-2 border-purple-200"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Profile Photo</Label>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setWidgetOpen(true)}
                      className="mt-2"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">First Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter first name..."
                  {...register("name")}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname">Last Name *</Label>
                <Input
                  id="surname"
                  placeholder="Enter last name..."
                  {...register("surname")}
                  className={errors.surname ? "border-red-500" : ""}
                />
                {errors.surname && (
                  <p className="text-sm text-red-500">
                    {errors.surname.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number..."
                  {...register("phone")}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  placeholder="Enter address..."
                  {...register("address")}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Input
                  id="bloodType"
                  placeholder="Enter blood type..."
                  {...register("bloodType")}
                  className={errors.bloodType ? "border-red-500" : ""}
                />
                {errors.bloodType && (
                  <p className="text-sm text-red-500">
                    {errors.bloodType.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday">Birthday</Label>
                <Input
                  id="birthday"
                  type="date"
                  {...register("birthday")}
                  className={errors.birthday ? "border-red-500" : ""}
                />
                {errors.birthday && (
                  <p className="text-sm text-red-500">
                    {errors.birthday.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <Controller
                  control={control}
                  name="sex"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={errors.sex ? "border-red-500" : ""}
                      >
                        <User className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select gender" />
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
                {errors.sex && (
                  <p className="text-sm text-red-500">{errors.sex.message}</p>
                )}
              </div>
            </div>

            {/* Subjects Section */}
            <div className="space-y-4">
              <Label>Assigned Subjects</Label>
              <Controller
                name="subjects"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={handleSubjectChange}
                    value={selectedSubjects.join(",")}
                  >
                    <SelectTrigger
                      className={errors.subjects ? "border-red-500" : ""}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Subjects</SelectLabel>
                        {subjects.map(
                          (subject: { id: number; name: string }) => (
                            <SelectItem
                              key={subject.id}
                              value={String(subject.id)}
                              className={
                                selectedSubjects.includes(String(subject.id))
                                  ? "bg-purple-50"
                                  : ""
                              }
                            >
                              {subject.name}
                              {selectedSubjects.includes(String(subject.id)) &&
                                " ✓"}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subjects && (
                <p className="text-sm text-red-500">
                  {errors.subjects.message}
                </p>
              )}

              {/* Selected Subjects Display */}
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedSubjects.map((subjectId) => {
                    const subject = subjects.find(
                      (s: { id: number }) => s.id.toString() === subjectId
                    );
                    return (
                      <Badge
                        key={subjectId}
                        variant="secondary"
                        className="bg-purple-100 text-purple-700 border-purple-200"
                      >
                        {subject?.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <GraduationCap className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-800">
                    Teacher Information
                  </h4>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Ensure all required fields are filled correctly</li>
                    <li>• Profile photo helps with identification</li>
                    <li>• Subjects can be assigned or modified later</li>
                    <li>• Phone number must be unique in the system</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cloudinary Widget Modal */}
          {widgetOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
              <div className="relative bg-white p-6 rounded-lg max-w-md w-full">
                <button
                  onClick={() => setWidgetOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-[101]"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-medium mb-4">
                  Upload Profile Photo
                </h3>
                <CldUploadWidget
                  uploadPreset={`${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`}
                  onSuccess={(result, { widget }) => {
                    setImg(result.info);
                    widget.close();
                    setWidgetOpen(false);
                  }}
                  onClose={() => setWidgetOpen(false)}
                >
                  {({ open }) => (
                    <div className="text-center p-4">
                      <Button
                        type="button"
                        onClick={() => open?.()}
                        className="bg-purple-600 text-white"
                        disabled={!open}
                      >
                        Open Upload Widget
                      </Button>
                    </div>
                  )}
                </CldUploadWidget>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Teacher"
              ) : (
                "Update Teacher"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TeacherForm;
