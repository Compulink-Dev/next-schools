// components/forms/ResultForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { resultSchema, ResultSchema } from "@/lib/formValidationSchemas";
import { updateResult } from "@/lib/actions";
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
import { Loader2, FileText, User, GraduationCap, Award } from "lucide-react";

// Define proper types for the data prop
interface ResultFormData {
  id: string;
  title: string;
  studentName: string;
  studentSurname: string;
  teacherName: string;
  teacherSurname: string;
  score?: number; // Make score optional
  className: string;
  startTime: string;
}

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data: ResultFormData;
  setOpen: (open: boolean) => void;
  relatedData: any;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: {
      score: data?.score || 0, // Provide fallback value
      studentId: data?.id?.toString() || "",
    },
  });

  const router = useRouter();

  if (type === "create") {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Operation Not Allowed
          </h3>
          <p className="text-gray-600">
            Result creation is not supported through this form.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Add safety check for update form
  if (!data) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Data Not Found
          </h3>
          <p className="text-gray-600">
            Unable to load result data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const payload = {
        id: data.id,
        score: formData.score,
        studentId: formData.studentId,
      };

      const result = await updateResult(payload);

      if (result.success) {
        toast.success("Score updated successfully!");
        setOpen(false);
        router.refresh();
      } else {
        toast.error("Failed to update the score!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-50 to-red-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
            <Award className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Update Exam Result</CardTitle>
            <CardDescription>
              Update the score for {data.studentName} {data.studentSurname}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Student Information
                </Label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">
                    {data.studentName} {data.studentSurname}
                  </p>
                  <p className="text-sm text-gray-600">
                    Class: {data.className}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Exam Information
                </Label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">{data.title}</p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(data.startTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Teacher Information
                </Label>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-medium">
                    {data.teacherName} {data.teacherSurname}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="score" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Score *
                </Label>
                <Input
                  id="score"
                  type="number"
                  placeholder="Enter score..."
                  {...register("score", { valueAsNumber: true })}
                  className={errors.score ? "border-red-500" : ""}
                />
                {errors.score && (
                  <p className="text-sm text-red-500">{errors.score.message}</p>
                )}
              </div>
            </div>
          </div>

          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Award className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-red-800">
                    Score Information
                  </h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>
                      • Ensure the score is accurate and reflects the student's
                      performance
                    </li>
                    <li>• Scores will be visible to students and parents</li>
                    <li>• Double-check the score before submitting</li>
                    <li>• This action cannot be easily reversed</li>
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
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Score"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ResultForm;
