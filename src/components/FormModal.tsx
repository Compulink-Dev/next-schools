"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteEvent,
  deleteAnnouncement,
  deleteResult,
  deleteLesson,
  deleteMessage,
  deleteAttendance,
  deleteAssignment,
  deleteParent,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";
import { Plus, Eye, Trash, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

const deleteActionMap: Record<
  string,
  (
    prevState: any,
    data: FormData
  ) => Promise<{ success: boolean; error: boolean }>
> = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  lesson: deleteLesson,
  assignment: deleteAssignment,
  result: deleteResult,
  attendance: deleteAttendance,
  event: deleteEvent,
  announcement: deleteAnnouncement,
  parent: deleteParent,
  message: deleteMessage,
};

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AssignmentForm = dynamic(() => import("./forms/AssignmentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ResultForm = dynamic(() => import("./forms/ResultForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AttendanceForm = dynamic(() => import("./forms/AttendanceForm"), {
  loading: () => <h1>Loading...</h1>,
});
const EventForm = dynamic(() => import("./forms/EventForm"), {
  loading: () => <h1>Loading...</h1>,
});
const AnnouncementFormDynamic = dynamic(
  () => import("./forms/AnnouncementForm"),
  { loading: () => <h1>Loading...</h1> }
);
const MessageFormDynamic = dynamic(() => import("./forms/MessageForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentFormDynamic = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});

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
  lesson: (setOpen, type, data, relatedData) => (
    <LessonForm
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
  result: (setOpen, type, data, relatedData) => (
    <ResultForm type={type} data={data} setOpen={setOpen} />
  ),
  attendance: (setOpen, type, data, relatedData) => (
    <AttendanceForm
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
  announcement: (setOpen, type, data, relatedData) => (
    <AnnouncementFormDynamic
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  message: (setOpen, type, data, relatedData) => (
    <MessageFormDynamic
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentFormDynamic
      type={type}
      data={relatedData?.parentData || data}
      setOpen={setOpen}
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
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";
  const router = useRouter();

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append("id", String(id));

    try {
      await toast.promise(deleteActionMap[table]({}, formData), {
        pending: `Deleting ${table}...`,
        success: `${table} has been deleted!`,
        error: `Failed to delete ${table}`,
      });
      router.refresh();
    } catch (err) {
      console.error("❌ Error deleting:", err);
    }
  };

  const getDialogTitle = () => {
    switch (type) {
      case "create":
        return `Create New ${table.charAt(0).toUpperCase() + table.slice(1)}`;
      case "update":
        return `Update ${table.charAt(0).toUpperCase() + table.slice(1)}`;
      case "delete":
        return `Delete ${table.charAt(0).toUpperCase() + table.slice(1)}`;
      default:
        return `${table.charAt(0).toUpperCase() + table.slice(1)}`;
    }
  };

  const getDialogDescription = () => {
    switch (type) {
      case "create":
        return `Add a new ${table} to the system.`;
      case "update":
        return `Modify the details of this ${table}.`;
      case "delete":
        return `Are you sure you want to delete this ${table}? This action cannot be undone.`;
      default:
        return "";
    }
  };

  const FormContent = () => {
    if (type === "delete" && id) {
      return (
        <div className="flex flex-col gap-4">
          <span className="text-center font-medium">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleDelete} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </div>
      );
    }

    if (type === "create" || type === "update") {
      const FormComponent = forms[table];
      if (FormComponent) {
        return FormComponent(() => {}, type, data, relatedData);
      }
      return <div>Form not found!</div>;
    }

    return "Form not found!";
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className={`${size} flex items-center justify-center rounded-full ${bgColor} p-0`}
          size="icon"
        >
          {type === "create" && <Plus className="w-4 h-4 text-white" />}
          {type === "update" && <Eye className="w-4 h-4 text-white" />}
          {type === "delete" && <Trash className="w-4 h-4 text-white" />}
        </Button>
      </DialogTrigger>
      <DialogContent className="z-40 sm:max-w-[425px] md:max-w-[600px] lg:max-w-[700px] ">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <FormContent />
      </DialogContent>
    </Dialog>
  );
};

export default FormModal;
