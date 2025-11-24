//@ts-nocheck
// components/forms/FeeForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Controller } from "react-hook-form";
import { DateTimePicker } from "../DateTimePicker";
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
import { Loader2, DollarSign, Calendar, Users, User } from "lucide-react";
import { createFee, updateFee } from "@/lib/actions";
import { feeSchema, FeeFormValues } from "@/lib/formValidationSchemas";

const FeeForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: Partial<FeeFormValues>;
  setOpen: (open: boolean) => void;
  relatedData?: {
    classes: { id: string; name: string }[];
    students: { id: string; name: string; surname: string }[];
  };
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FeeFormValues>({
    resolver: zodResolver(feeSchema),
    defaultValues: {
      ...data,
      dueDate: data?.dueDate
        ? new Date(data.dueDate)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      classId: data?.classId || undefined,
      studentId: data?.studentId || undefined,
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      const result =
        type === "create"
          ? await createFee(formData)
          : await updateFee(formData);

      if (result.success) {
        toast.success(
          `Fee ${type === "create" ? "created" : "updated"} successfully!`
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
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Create Fee" : "Update Fee"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Create a new fee for students or classes"
                : "Modify fee details"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Fee Title *</Label>
              <Input
                id="title"
                placeholder="Enter fee title..."
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount..."
                {...register("amount", { valueAsNumber: true })}
                className={errors.amount ? "border-red-500" : ""}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Controller
                control={control}
                name="dueDate"
                render={({ field }) => (
                  <DateTimePicker
                    label="Due Date *"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.dueDate?.message}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Class (Optional)</Label>
              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <SelectTrigger>
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Classes</SelectLabel>
                        <SelectItem value="none">None</SelectItem>
                        {relatedData?.classes?.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Student (Optional)</Label>
              <Controller
                control={control}
                name="studentId"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <SelectTrigger>
                      <User className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Students</SelectLabel>
                        <SelectItem value="none">None</SelectItem>
                        {relatedData?.students?.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name} {s.surname}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <DollarSign className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-emerald-800">
                    Fee Information
                  </h4>
                  <ul className="text-xs text-emerald-700 space-y-1">
                    <li>
                      • Amount should be in the smallest currency unit (e.g.,
                      cents)
                    </li>
                    <li>• Due date is when the fee payment is expected</li>
                    <li>
                      • You can assign fees to specific classes or students
                    </li>
                    <li>
                      • Leave both class and student empty for general fees
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Fee"
              ) : (
                "Update Fee"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default FeeForm;
