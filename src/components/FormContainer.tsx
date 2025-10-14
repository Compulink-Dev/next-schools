"use client";

import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "grade"
    | "announcement"
    | "message"
    | "fee";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  relatedData?: any;
};

const FormContainer = ({ table, type, data, id }: FormContainerProps) => {
  const [relatedData, setRelatedData] = useState({});
  const [loading, setLoading] = useState(true);
  const { user, isLoaded } = useUser();

  // Get role from user's public metadata
  const role = user?.publicMetadata?.role as string;
  const currentUserId = user?.id;

  useEffect(() => {
    const fetchRelatedData = async () => {
      if (type === "delete") {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/form-data?table=${table}&type=${type}&id=${id || ""}`,
          {
            headers: {
              "Cache-Control": "no-cache",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setRelatedData(data);
        }
      } catch (error) {
        console.error("Error fetching related data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded) {
      fetchRelatedData();
    }
  }, [table, type, id, isLoaded]);

  if (loading) {
    return (
      <div className="">
        <Loader2 className="animate-spiner" />
      </div>
    );
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
