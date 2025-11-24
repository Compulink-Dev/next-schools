//@ts-nocheck
// components/forms/GradeForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { createGrade, updateGrade } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, GraduationCap, Hash } from "lucide-react";
import { gradeSchema, GradeSchema } from "@/lib/formValidationSchemas";

const GradeForm = ({
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
    formState: { errors },
  } = useForm<GradeSchema>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      level: data?.level ? String(data.level) : "",
      description: data?.description || "",
      id: data?.id || "",
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("level", formData.level);
      if (formData.description) {
        formDataObj.append("description", formData.description);
      }
      if (formData.id) {
        formDataObj.append("id", formData.id);
      }

      const result =
        type === "create"
          ? await createGrade({ success: false, error: false }, formDataObj)
          : await updateGrade({ success: false, error: false }, formDataObj);

      if (result.success) {
        toast.success(
          `Grade ${type === "create" ? "created" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Failed to process your request");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Grade" : "Update Grade"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Create a new academic grade level"
                : "Modify grade information"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="level">Grade Level *</Label>
              <Input
                id="level"
                type="number"
                placeholder="Enter grade level..."
                {...register("level")}
                className={errors.level ? "border-red-500" : ""}
              />
              {errors.level && (
                <p className="text-sm text-red-500">{errors.level.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter grade description..."
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Hash className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-purple-800">
                    Grade Information
                  </h4>
                  <ul className="text-xs text-purple-700 space-y-1">
                    <li>• Grade level must be a unique positive number</li>
                    <li>• Description is optional but recommended</li>
                    <li>
                      • Once created, classes can be assigned to this grade
                    </li>
                    <li>
                      • Grade levels help organize students by academic
                      progression
                    </li>
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
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Grade"
              ) : (
                "Update Grade"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GradeForm;
