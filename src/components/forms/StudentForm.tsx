"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchemas";
import { createStudent, updateStudent } from "@/lib/actions";
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
  Users,
  GraduationCap,
  Calendar,
  Droplets,
  Phone,
  MapPin,
  Upload,
  Shield,
} from "lucide-react";
import Image from "next/image";
import { CldUploadWidget } from "next-cloudinary";

const StudentForm = ({
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

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
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
      parentId: data?.parentId || "",
      id: data?.id || "",
      sex: data?.sex || "MALE",
      gradeId: data?.gradeId || "",
      classId: data?.classId || "",
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const submissionData = {
        ...formData,
        img: img?.secure_url || img || data?.img,
      };

      const result =
        type === "create"
          ? await createStudent(submissionData)
          : await updateStudent(submissionData);

      if (result.success) {
        toast.success(
          `Student ${type === "create" ? "created" : "updated"} successfully!`
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

  const { grades, classes, parents = [] } = relatedData || {};

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Student" : "Update Student"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Add a new student to the system"
                : "Modify student information"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Authentication Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">
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
              <User className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-900">
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
                        className="rounded-full object-cover border-2 border-blue-200"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Profile Photo</Label>
                    <CldUploadWidget
                      uploadPreset="school"
                      onSuccess={(result, { widget }) => {
                        setImg(result.info);
                        widget.close();
                      }}
                    >
                      {({ open }) => (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => open()}
                          className="mt-2"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                      )}
                    </CldUploadWidget>
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

              <div className="space-y-2">
                <Label>Parent *</Label>
                <Controller
                  control={control}
                  name="parentId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={errors.parentId ? "border-red-500" : ""}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Parents</SelectLabel>
                          {parents.map(
                            (parent: {
                              id: string;
                              name: string;
                              surname: string;
                            }) => (
                              <SelectItem key={parent.id} value={parent.id}>
                                {parent.name} {parent.surname}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.parentId && (
                  <p className="text-sm text-red-500">
                    {errors.parentId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Grade *</Label>
                <Controller
                  control={control}
                  name="gradeId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={errors.gradeId ? "border-red-500" : ""}
                      >
                        <GraduationCap className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Grades</SelectLabel>
                          {grades.map(
                            (grade: { id: string; level: number }) => (
                              <SelectItem
                                key={grade.id}
                                value={grade.id.toString()}
                              >
                                Grade {grade.level}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.gradeId && (
                  <p className="text-sm text-red-500">
                    {errors.gradeId.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Class *</Label>
                <Controller
                  control={control}
                  name="classId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        className={errors.classId ? "border-red-500" : ""}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Classes</SelectLabel>
                          {classes.map(
                            (classItem: {
                              id: string;
                              name: string;
                              capacity: number;
                              _count: { students: number };
                            }) => (
                              <SelectItem
                                key={classItem.id}
                                value={classItem.id.toString()}
                              >
                                {classItem.name} - {classItem._count.students}/
                                {classItem.capacity}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.classId && (
                  <p className="text-sm text-red-500">
                    {errors.classId.message}
                  </p>
                )}
              </div>
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <GraduationCap className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800">
                    Student Information
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Ensure all required fields are filled correctly</li>
                    <li>• Profile photo helps with identification</li>
                    <li>• Parent information is required for communication</li>
                    <li>• Class assignment determines student schedule</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Student"
              ) : (
                "Update Student"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default StudentForm;
