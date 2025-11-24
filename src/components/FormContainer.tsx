// components/FormContainer.tsx
"use client";

import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

const FormContainer = ({
  table,
  type,
  data,
  id,
  relatedData: initialRelatedData,
}: FormContainerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [relatedData, setRelatedData] = useState<any>(initialRelatedData);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const fetchRelatedData = async () => {
      // Only fetch related data for create forms that need it
      if (type === "create" && (table === "attendance" || table === "result")) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/${table}/related-data`);
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setRelatedData(result.data);
            }
          }
        } catch (error) {
          console.error(`Error fetching related data for ${table}:`, error);
        }
      }
      setIsLoading(false);
    };

    fetchRelatedData();
  }, [table, type]);

  if (isLoading || !isLoaded) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
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
