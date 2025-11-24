"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchemas";
import { createSubject, updateSubject } from "@/lib/actions";
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
import { Loader2, BookOpen, User, GraduationCap } from "lucide-react";

type SubjectFormValues = {
  id?: string;
  name: string;
  teachers: string[];
};

const SubjectForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<SubjectSchema>;
  setOpen: (open: boolean) => void;
  relatedData?: { teachers: { id: number; name: string; surname: string }[] };
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id?.toString() || "",
      name: data?.name || "",
      teachers: data?.teachers?.map((t: any) => t.id.toString()) || [],
    },
  });

  const router = useRouter();
  const { teachers = [] } = relatedData || {};

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        teachers: formData.teachers,
      };

      const result =
        type === "create"
          ? await createSubject(payload)
          : await updateSubject({
              ...payload,
              id: formData.id,
            });

      if (result?.success) {
        toast.success(
          `Subject ${type === "create" ? "created" : "updated"} successfully!`
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

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-50 to-green-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Subject" : "Update Subject"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Add a new subject to the curriculum"
                : "Modify subject details"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                placeholder="Enter subject name..."
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Assigned Teacher *</Label>
              <Controller
                control={control}
                name="teachers"
                render={({ field }) => (
                  <Select
                    value={field.value?.[0] || ""}
                    onValueChange={(val) => field.onChange([val])}
                  >
                    <SelectTrigger
                      className={errors.teachers ? "border-red-500" : ""}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Teachers</SelectLabel>
                        {teachers.map((teacher) => (
                          <SelectItem
                            key={teacher.id}
                            value={teacher.id.toString()}
                          >
                            {teacher.name} {teacher.surname}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.teachers && (
                <p className="text-sm text-red-500">
                  {errors.teachers.message}
                </p>
              )}
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          {teachers.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green-800">
                      Available Teachers
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {teachers.map((teacher) => (
                        <Badge
                          key={teacher.id}
                          variant="secondary"
                          className="bg-white text-green-700 border-green-200"
                        >
                          {teacher.name} {teacher.surname}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <BookOpen className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-green-800">
                    Subject Information
                  </h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Subject names should be clear and descriptive</li>
                    <li>
                      • Each subject must have at least one assigned teacher
                    </li>
                    <li>• Subjects will appear in student schedules</li>
                    <li>• Teachers can be assigned to multiple subjects</li>
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
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Subject"
              ) : (
                "Update Subject"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubjectForm;
