// components/forms/ClassForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { classSchema, ClassSchema } from "@/lib/formValidationSchemas";
import { createClass, updateClass } from "@/lib/actions";
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
import { Loader2, Users, GraduationCap, UserCog } from "lucide-react";

const ClassForm = ({
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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: data?.name || "",
      capacity: data?.capacity ? Number(data.capacity) : 0,
      supervisorId: data?.supervisorId || "",
      gradeId: data?.gradeId || "",
      id: data?.id || "",
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const result =
        type === "create"
          ? await createClass(formData)
          : await updateClass(formData);

      if (result.success) {
        toast.success(
          `Class ${type === "create" ? "created" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  });

  const { teachers, grades } = relatedData;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Class" : "Update Class"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Create a new class and assign supervisor"
                : "Modify class information"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Class Name *</Label>
              <Input
                id="name"
                placeholder="Enter class name..."
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity *</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Enter capacity..."
                {...register("capacity", { valueAsNumber: true })}
                className={errors.capacity ? "border-red-500" : ""}
              />
              {errors.capacity && (
                <p className="text-sm text-red-500">
                  {errors.capacity.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Supervisor *</Label>
              <Controller
                control={control}
                name="supervisorId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={errors.supervisorId ? "border-red-500" : ""}
                    >
                      <UserCog className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Teachers</SelectLabel>
                        {teachers.map(
                          (teacher: {
                            id: string;
                            name: string;
                            surname: string;
                          }) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name} {teacher.surname}
                            </SelectItem>
                          )
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.supervisorId && (
                <p className="text-sm text-red-500">
                  {errors.supervisorId.message}
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
                        {grades.map((grade: { id: string; level: number }) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            Grade {grade.level}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gradeId && (
                <p className="text-sm text-red-500">{errors.gradeId.message}</p>
              )}
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Users className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-indigo-800">
                    Class Information
                  </h4>
                  <ul className="text-xs text-indigo-700 space-y-1">
                    <li>• Class name should be unique and descriptive</li>
                    <li>• Capacity determines maximum student enrollment</li>
                    <li>
                      • Supervisor will be responsible for class management
                    </li>
                    <li>• Grade determines the academic level of the class</li>
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
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Class"
              ) : (
                "Update Class"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ClassForm;
