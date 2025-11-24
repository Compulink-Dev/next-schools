// components/forms/MessageForm.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { messageSchema, MessageSchema } from "@/lib/formValidationSchemas";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, MessageSquare, User, Mail, AlertCircle } from "lucide-react";
import { createMessage, updateMessage } from "@/lib/actions";

// Create a modified schema for the form that doesn't require sender fields
const messageFormSchema = messageSchema.omit({
  senderId: true,
  senderType: true,
});

type MessageFormData = Omit<MessageSchema, "senderId" | "senderType">;

type MessageFormProps = {
  type: "create" | "update";
  data?: MessageSchema;
  setOpen: (open: boolean) => void;
  relatedData?: {
    teachers: { id: string; clerkId: string; name: string; surname: string }[];
    students: { id: string; clerkId: string; name: string; surname: string }[];
    admins: { id: string; clerkId: string; name: string; surname: string }[];
  };
};

const MessageForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: MessageFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [senderInfo, setSenderInfo] = useState<{
    id: string;
    type: "TEACHER" | "STUDENT" | "ADMIN";
  } | null>(null);
  const [selectedReceiverType, setSelectedReceiverType] = useState<string>(
    data?.receiverType || "STUDENT"
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger,
    setValue,
    control,
  } = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: data
      ? {
          id: data.id,
          title: data.title,
          content: data.content,
          receiverId: data.receiverId,
          receiverType: data.receiverType,
        }
      : {
          title: "",
          content: "",
          receiverId: "",
          receiverType: "STUDENT",
        },
    mode: "onChange",
  });

  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Set sender info when user loads
  useEffect(() => {
    if (isLoaded && user?.id) {
      const userRole = (user?.publicMetadata?.role as string)?.toUpperCase();
      let senderType: "TEACHER" | "STUDENT" | "ADMIN" = "ADMIN";

      if (userRole === "TEACHER") {
        senderType = "TEACHER";
      } else if (userRole === "STUDENT") {
        senderType = "STUDENT";
      }

      setSenderInfo({
        id: user.id,
        type: senderType,
      });

      console.log("👤 Sender info set:", { id: user.id, type: senderType });
    }
  }, [user, isLoaded]);

  // Get available receivers based on selected type
  const getAvailableReceivers = () => {
    if (!relatedData) return [];

    switch (selectedReceiverType) {
      case "TEACHER":
        return relatedData.teachers || [];
      case "STUDENT":
        return relatedData.students || [];
      case "ADMIN":
        return relatedData.admins || [];
      default:
        return [];
    }
  };

  const availableReceivers = getAvailableReceivers();

  const onSubmit = async (formData: MessageFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    console.log("📨 Form submitted with data:", formData);
    console.log("👤 Sender info:", senderInfo);

    try {
      if (!isLoaded || !user?.id || !senderInfo) {
        toast.error("User not loaded. Please try again.");
        setIsLoading(false);
        return;
      }

      // Manual validation check
      const isValid = await trigger();
      if (!isValid) {
        console.log("❌ Form validation failed");
        toast.error("Please fix the form errors before submitting.");
        setIsLoading(false);
        return;
      }

      // Prepare submission data with sender info
      const submissionData: MessageSchema = {
        ...formData,
        senderId: senderInfo.id,
        senderType: senderInfo.type,
      };

      console.log("🚀 Submitting message data:", submissionData);

      const result =
        type === "create"
          ? await createMessage(submissionData)
          : await updateMessage(submissionData);

      console.log("📬 Server response:", result);

      if (result.success) {
        toast.success(
          `Message ${type === "create" ? "sent" : "updated"} successfully!`
        );
        setOpen(false);
        router.refresh();
      } else {
        // Show the specific error message from the server
        const errorMessage =
          result.error || "Failed to send message. Please try again.";
        toast.error(errorMessage);
        setSubmitError(errorMessage);
        console.error("❌ Server returned error:", result.error);
      }
    } catch (error) {
      console.error("💥 Unexpected error:", error);
      const errorMessage =
        "An unexpected error occurred. Please check the console for details.";
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle receiver type change
  const handleReceiverTypeChange = (value: string) => {
    setSelectedReceiverType(value);
    setValue("receiverType", value as any);
    setValue("receiverId", ""); // Reset receiver when type changes
    trigger("receiverType");
  };

  // Handle receiver selection
  const handleReceiverChange = (value: string) => {
    setValue("receiverId", value);
    trigger("receiverId");
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-violet-50 to-violet-100/50 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-500 rounded-full flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">
              {type === "create" ? "Send Message" : "Update Message"}
            </CardTitle>
            <CardDescription>
              {type === "create"
                ? "Send a message to students, teachers, or administrators"
                : "Modify message details"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Validation Errors Summary */}
        {Object.keys(errors).length > 0 && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-2">
                    Please fix the following errors:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.title && <li>• Title: {errors.title.message}</li>}
                    {errors.content && (
                      <li>• Content: {errors.content.message}</li>
                    )}
                    {errors.receiverId && (
                      <li>• Receiver: Please select a receiver</li>
                    )}
                    {errors.receiverType && (
                      <li>• Receiver Type: {errors.receiverType.message}</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Error */}
        {submitError && (
          <Card className="bg-red-50 border-red-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">
                    Submission Error
                  </h4>
                  <p className="text-sm text-red-700 mt-1">{submitError}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Message Title *</Label>
              <Input
                id="title"
                placeholder="Enter message title..."
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
                onBlur={() => trigger("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverType">Receiver Type *</Label>
              <Select
                value={selectedReceiverType}
                onValueChange={handleReceiverTypeChange}
              >
                <SelectTrigger
                  className={errors.receiverType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select receiver type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.receiverType && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.receiverType.message}
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="receiverId">
                Select Receiver * ({availableReceivers.length} available)
              </Label>
              <Select onValueChange={handleReceiverChange}>
                <SelectTrigger
                  className={errors.receiverId ? "border-red-500" : ""}
                >
                  <SelectValue
                    placeholder={`Select a ${selectedReceiverType.toLowerCase()}`}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableReceivers.length > 0 ? (
                    availableReceivers.map((receiver) => (
                      <SelectItem
                        key={receiver.clerkId || receiver.id}
                        value={receiver.clerkId || receiver.id}
                      >
                        {receiver.name} {receiver.surname} -{" "}
                        {receiver.clerkId ? "Clerk User" : "Database User"}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-users" disabled>
                      No {selectedReceiverType.toLowerCase()}s available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.receiverId && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Please select a receiver
                </p>
              )}
              {availableReceivers.length === 0 && (
                <p className="text-sm text-amber-600">
                  No {selectedReceiverType.toLowerCase()}s found. Please check
                  if there are users with this role in the system.
                </p>
              )}
            </div>

            {data?.id && <input type="hidden" {...register("id")} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter your message here..."
              className={`min-h-[120px] ${
                errors.content ? "border-red-500" : ""
              }`}
              {...register("content")}
              onBlur={() => trigger("content")}
            />
            {errors.content && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Display sender information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-blue-600" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">
                    Sending as: {user?.fullName || "Loading..."}
                  </h4>
                  <p className="text-xs text-blue-700">
                    Role:{" "}
                    {(user?.publicMetadata?.role as string) || "Loading..."} |
                    ID: {user?.id || "Loading..."}
                    {senderInfo && ` | Type: ${senderInfo.type}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-violet-50 border-violet-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-violet-800">
                    Message Information
                  </h4>
                  <ul className="text-xs text-violet-700 space-y-1">
                    <li>
                      • Messages will be delivered to the specified receiver
                    </li>
                    <li>
                      • Select receiver from the dropdown to ensure validity
                    </li>
                    <li>
                      • Use clear and concise titles for better communication
                    </li>
                    <li>• Messages are private and secure</li>
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !isLoaded ||
                !senderInfo ||
                !watch("receiverId") ||
                availableReceivers.length === 0
              }
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {type === "create" ? "Sending..." : "Updating..."}
                </>
              ) : type === "create" ? (
                "Send Message"
              ) : (
                "Update Message"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MessageForm;
