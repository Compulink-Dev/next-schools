// app/parents/[id]/page.tsx
import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Parent } from "@prisma/client";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link"; // Import Link
//importing student type
import { Student } from "@prisma/client";

interface ParentWithStudents extends Parent {
  students: Student[];
}

const SingleParentPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const parent: ParentWithStudents | null = await prisma.parent.findUnique({
    where: { id },
    include: {
      students: true,
    },
  });

  if (!parent) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {parent.name + " " + parent.surname}
                </h1>
                {role === "admin" && (
                  <FormContainer table="parent" type="update" data={parent} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {/* A brief description about the parent can be added here */}
                Connected Students: {parent.students.map((student) => student.name).join(", ") || "No students connected"}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/2 lg:w-full xl:w-1/2 flex items-center gap-2">
                  <Image src="/mail.png" alt="mail" width={14} height={14} />
                  <span>{parent.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/2 lg:w-full xl:w-1/2 flex items-center gap-2">
                  <Image src="/phone.png" alt="phone" width={14} height={14} />
                  <span>{parent.phone || "-"}</span>
                </div>
                <div className="w-full flex items-center gap-2">
                  <Image src="/address.png" alt="address" width={14} height={14} />
                  <span>{parent.address || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* SMALL CARDS - Adapt as needed for parent-specific info */}
          <div className="flex-1 flex gap-4 justify-between flex-wrap">
            {/* Example Card - Total Students */}
            <div className="bg-white p-4 rounded-md flex gap-4 w-full md:w-[48%] xl:w-[45%] 2xl:w-[48%]">
              <Image
                src="/singleStudent.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="">
                <h1 className="text-xl font-semibold">{parent.students.length}</h1>
                <span className="text-sm text-gray-400">Total Students</span>
              </div>
            </div>
            {/* Add more cards as needed */}
          </div>
        </div>
        {/* BOTTOM - Add parent-related content here */}
        <div className="mt-4 bg-white rounded-md p-4 h-[400px]">
          <h1>Parent Details</h1>
          {/* Add any specific details or components related to the parent here */}
          <p>Additional information about the parent can be displayed here.</p>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            {/* Add links related to the parent, e.g., list of their students */}
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/students?parentId=${parent.id}`}
            >
              Parent&apos;s Students
            </Link>
            {/* Add more links as needed */}
          </div>
        </div>
        {/* Add other components as needed */}
      </div>
    </div>
  );
};

export default SingleParentPage;