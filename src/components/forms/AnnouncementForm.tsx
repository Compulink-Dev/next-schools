// components/forms/AnnouncementForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone, Calendar, Users } from "lucide-react";

type AnnouncementFormProps = {
  type: "create" | "update";
  data?: AnnouncementSchema;
  setOpen: (open: boolean) => void;
  relatedData?: { classes: { id: string; name: string }[] };
};

const AnnouncementForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: AnnouncementFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      id: data?.id || "",
      title: data?.title || "",
      description: data?.description || "",
      date: data?.date ? new Date(data.date) : new Date(),
      classId: data?.classId || "all", // Use "all" as default instead of undefined
    },
  });

  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setIsLoading(true);
    try {
      // Convert "all" to undefined for classId
      const submissionData = {
        ...formData,
        classId: formData.classId === "all" ? undefined : formData.classId,
      };

      console.log("📨 Submitting announcement:", submissionData);

      const result =
        type === "create"
          ? await createAnnouncement(submissionData)
          : await updateAnnouncement(submissionData);

      console.log("📬 Server response:", result);

      if (result.success) {
        toast.success(
          `Announcement ${
            type === "create" ? "created" : "updated"
          } successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong!");
      }
    } catch (error) {
      console.error("💥 Error creating announcement:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  });

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Megaphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create"
                ? "Create Announcement"
                : "Update Announcement"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Share important information with students and staff"
                : "Modify announcement details"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter announcement title..."
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="classId">Target Audience</Label>
              <Controller
                control={control}
                name="classId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Classes</SelectLabel>
                        <SelectItem value="all">All Classes</SelectItem>
                        {relatedData?.classes?.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && (
                <p className="text-sm text-red-500">{errors.classId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Announcement Date *</Label>
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DateTimePicker
                    label="Announcement Date"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.date?.message}
                  />
                )}
              />
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Enter announcement details..."
              className={`min-h-[120px] ${
                errors.description ? "border-red-500" : ""
              }`}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Megaphone className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800">
                    Announcement Guidelines
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>
                      • Announcements will be visible to selected classes or all
                      classes
                    </li>
                    <li>
                      • Date determines when the announcement will be published
                    </li>
                    <li>
                      • Use clear and concise titles for better visibility
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Creating..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Create Announcement"
              ) : (
                "Update Announcement"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AnnouncementForm;
