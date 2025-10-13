import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Class, Exam, Subject, Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type ExamWithRelations = Exam & {
  lesson: {
    subject: Subject;
    class: Class;
    teacher: Teacher;
  };
};

const SingleExamPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const exam: ExamWithRelations | null = await prisma.exam.findUnique({
    where: { id },
    include: {
      lesson: {
        include: {
          subject: true,
          class: true,
          teacher: true,
        },
      },
    },
  });

  if (!exam) {
    return notFound();
  }

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* TOP */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* EXAM INFO CARD */}
        <div className="bg-lamaSky py-6 px-4 rounded-md flex-1 flex gap-4">
          <div className="w-1/3">
            <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center">
              <Image src="/exam.png" alt="Exam" width={64} height={64} />
            </div>
          </div>
          <div className="w-2/3 flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">{exam.title}</h1>
              {(role === "admin" || role === "teacher") && (
                <FormContainer table="exam" type="update" data={exam} />
              )}
            </div>
            <p className="text-sm text-gray-500">
              Exam for {exam.lesson.subject.name} class
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/subject.png" alt="" width={14} height={14} />
                <span>{exam.lesson.subject.name}</span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/class.png" alt="" width={14} height={14} />
                <span>{exam.lesson.class.name}</span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/teacher.png" alt="" width={14} height={14} />
                <span>
                  {exam.lesson.teacher.name} {exam.lesson.teacher.surname}
                </span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/date.png" alt="" width={14} height={14} />
                <span>
                  {new Intl.DateTimeFormat("en-US").format(exam.startTime)}
                </span>
              </div>
              <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                <Image src="/time.png" alt="" width={14} height={14} />
                <span>
                  {new Date(exam.startTime).toLocaleTimeString()} -{" "}
                  {new Date(exam.endTime).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Quick Links</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
            <Link
              className="p-3 rounded-md bg-lamaSkyLight"
              href={`/list/lessons?classId=${exam.lesson.class.id}`}
            >
              Class Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaPurpleLight"
              href={`/list/teachers?classId=${exam.lesson.class.id}`}
            >
              Class Teachers
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/assignments?classId=${exam.lesson.class.id}`}
            >
              Class Assignments
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight"
              href={`/list/results?examId=${exam.id}`}
            >
              Exam Results
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleExamPage;
