// components/FormModal.tsx
"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteParent,
  deleteLesson,
  deleteAssignment,
  deleteResult,
  deleteAttendance,
  deleteEvent,
  deleteAnnouncement,
  deleteFee,
  deleteGrade,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { FormContainerProps } from "./FormContainer";
import { Loader2, X, Trash2, Edit, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  fee: deleteFee,
  grade: deleteGrade,
};

// Lazy-loaded forms with better loading states
const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <FormLoadingState />,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <FormLoadingState />,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <FormLoadingState />,
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <FormLoadingState />,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <FormLoadingState />,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <FormLoadingState />,
});
const GradeForm = dynamic(() => import("./forms/GradeForm"), {
  loading: () => <FormLoadingState />,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <FormLoadingState />,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <FormLoadingState />,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <FormLoadingState />,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <FormLoadingState />,
});
const MessageForm = dynamic(() => import("./forms/MessageForm"), {
  loading: () => <FormLoadingState />,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <FormLoadingState />,
});
const AnnouncementForm = dynamic(() => import("./forms/AnnouncementForm"), {
  loading: () => <FormLoadingState />,
});
const FeeForm = dynamic(() => import("./forms/FeeForm"), {
  loading: () => <FormLoadingState />,
});

const FormLoadingState = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading form...</p>
    </div>
  </div>
);

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  grade: (setOpen, type, data, relatedData) => (
    <GradeForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  event: (setOpen, type, data, relatedData) => (
    <EventForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  message: (setOpen, type, data, relatedData) => (
    <MessageForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  result: (setOpen, type, data, relatedData) => (
    <ResultForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  assignment: (setOpen, type, data, relatedData) => (
    <AssignmentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  fee: (setOpen, type, data, relatedData) => (
    <FeeForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const getButtonConfig = () => {
    const config = {
      create: {
        icon: Plus,
        bgColor: "bg-green-500 hover:bg-green-600",
        tooltip: `Add new ${table}`,
      },
      update: {
        icon: Edit,
        bgColor: "bg-blue-500 hover:bg-blue-600",
        tooltip: `Edit ${table}`,
      },
      delete: {
        icon: Trash2,
        bgColor: "bg-red-500 hover:bg-red-600",
        tooltip: `Delete ${table}`,
      },
    };
    return config[type];
  };

  const buttonConfig = getButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  const DeleteForm = () => {
    //@ts-ignore
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    useEffect(() => {
      if (state.success) {
        toast.success(
          `${
            table.charAt(0).toUpperCase() + table.slice(1)
          } has been deleted successfully!`
        );
        setOpen(false);
        router.refresh();
      }
      if (state.error) {
        toast.error(`Failed to delete ${table}. Please try again.`);
      }
    }, [state, router, table]);

    return (
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold">Delete {table}</h3>
          <p className="text-muted-foreground">
            This action cannot be undone. All data associated with this {table}{" "}
            will be permanently removed.
          </p>
        </div>
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="id" value={id} />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </form>
      </div>
    );
  };

  const FormContent = () => {
    if (type === "delete" && id) {
      return <DeleteForm />;
    }

    if (type === "create" || type === "update") {
      const FormComponent = forms[table];
      return FormComponent ? (
        FormComponent(setOpen, type, data, relatedData)
      ) : (
        <div className="text-center p-8">
          <p className="text-muted-foreground">
            Form not available for {table}.
          </p>
        </div>
      );
    }

    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Invalid form type.</p>
      </div>
    );
  };

  const getDialogTitle = () => {
    const action = type.charAt(0).toUpperCase() + type.slice(1);
    const tableName = table.charAt(0).toUpperCase() + table.slice(1);
    return `${action} ${tableName}`;
  };

  return (
    <>
      <Button
        size="sm"
        className={`rounded-full ${buttonConfig.bgColor} text-white`}
        onClick={() => setOpen(true)}
      >
        <ButtonIcon className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {buttonConfig.icon && <buttonConfig.icon className="h-5 w-5" />}
              {getDialogTitle()}
            </DialogTitle>
            {type === "delete" && (
              <DialogDescription>
                This action cannot be undone. Please confirm you want to
                proceed.
              </DialogDescription>
            )}
          </DialogHeader>

          <FormContent />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FormModal;
