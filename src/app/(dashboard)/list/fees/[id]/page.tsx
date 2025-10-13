import FormContainer from "@/components/FormContainer";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Fee, Class, Student } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type FeeWithRelations = Fee & {
  class?: Class;
  student?: Student;
};

const SingleFeePage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const fee: FeeWithRelations | null = await prisma.fee.findUnique({
    where: { id },
    include: {
      class: true,
      student: true,
    },
  });

  if (!fee) {
    return notFound();
  }

  const now = new Date();
  const dueDate = new Date(fee.dueDate);

  let status = "Pending";
  let statusColor = "text-yellow-600";
  let statusBg = "bg-yellow-50";

  if (fee.paid) {
    status = "Paid";
    statusColor = "text-green-600";
    statusBg = "bg-green-50";
  } else if (now > dueDate) {
    status = "Overdue";
    statusColor = "text-red-600";
    statusBg = "bg-red-50";
  }

  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* FEE INFO CARD */}
          <div
            className={`py-6 px-4 rounded-md flex-1 flex gap-4 ${statusBg} border`}
          >
            <div className="w-1/3">
              <div className="w-36 h-36 rounded-full bg-lamaSky flex items-center justify-center">
                <Image src="/fee.png" alt="Fee" width={64} height={64} />
              </div>
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">{fee.title}</h1>
                {(role === "admin" || role === "teacher") && (
                  <FormContainer table="fee" type="update" data={fee} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                {fee.description || "No description provided"}
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/amount.png" alt="" width={14} height={14} />
                  <span className="font-bold text-lg">
                    ${fee.amount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/due.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(dueDate)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/class.png" alt="" width={14} height={14} />
                  <span>{fee.class?.name || "All Classes"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/student.png" alt="" width={14} height={14} />
                  <span>
                    {fee.student
                      ? `${fee.student.name} ${fee.student.surname}`
                      : "All Students"}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/status.png" alt="" width={14} height={14} />
                  <span className={`font-semibold ${statusColor}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEE DETAILS */}
        <div className="mt-4 bg-white rounded-md p-4">
          <h2 className="text-lg font-semibold mb-4">Fee Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600">
                {fee.description || "No description provided."}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">
                  Payment Information
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Amount:</strong> ${fee.amount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Due Date:</strong>{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "full",
                    }).format(dueDate)}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={statusColor}>{status}</span>
                  </p>
                  {!fee.paid && (
                    <p>
                      <strong>Days until due:</strong>
                      <span
                        className={
                          daysUntilDue < 0
                            ? "text-red-600"
                            : daysUntilDue <= 7
                            ? "text-yellow-600"
                            : "text-green-600"
                        }
                      >
                        {daysUntilDue < 0
                          ? `Overdue by ${Math.abs(daysUntilDue)} days`
                          : `${daysUntilDue} days`}
                      </span>
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Audience</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <strong>Class:</strong> {fee.class?.name || "All Classes"}
                  </p>
                  <p>
                    <strong>Student:</strong>{" "}
                    {fee.student
                      ? `${fee.student.name} ${fee.student.surname}`
                      : "All Students"}
                  </p>
                  <p>
                    <strong>Type:</strong>{" "}
                    {fee.student
                      ? "Individual"
                      : fee.class
                      ? "Class-wide"
                      : "School-wide"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT SECTION - For students/parents */}
        {(role === "student" || role === "parent") && !fee.paid && (
          <div className="mt-4 bg-white rounded-md p-4">
            <h2 className="text-lg font-semibold mb-4">Make Payment</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-sm text-yellow-800 mb-3">
                This fee is currently {status.toLowerCase()}. Please make the
                payment before the due date.
              </p>
              <button className="bg-lamaSky text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-lamaSkyDark transition-colors">
                Pay Now - ${fee.amount.toFixed(2)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Quick Links</h1>
          <div className="mt-4 flex flex-col gap-2 text-xs text-gray-500">
            {fee.class && (
              <Link
                className="p-3 rounded-md bg-lamaSkyLight hover:bg-lamaSky transition-colors"
                href={`/list/classes/${fee.class.id}`}
              >
                Class Details
              </Link>
            )}
            {fee.student && (
              <Link
                className="p-3 rounded-md bg-lamaPurpleLight hover:bg-lamaPurple transition-colors"
                href={`/list/students/${fee.student.id}`}
              >
                Student Profile
              </Link>
            )}
            <Link
              className="p-3 rounded-md bg-pink-50 hover:bg-pink-100 transition-colors"
              href={`/list/fees?classId=${fee.classId || ""}`}
            >
              More {fee.class?.name ? "Class" : "School"} Fees
            </Link>
            <Link
              className="p-3 rounded-md bg-lamaYellowLight hover:bg-lamaYellow transition-colors"
              href="/financial"
            >
              Financial Overview
            </Link>
          </div>
        </div>

        {/* FEE STATS CARD */}
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Fee Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`font-semibold ${statusColor}`}>{status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="font-semibold">${fee.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Due Date</span>
              <span className="font-semibold">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "numeric",
                }).format(dueDate)}
              </span>
            </div>
            {!fee.paid && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Time Remaining</span>
                <span
                  className={`font-semibold ${
                    daysUntilDue < 0
                      ? "text-red-600"
                      : daysUntilDue <= 7
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}
                >
                  {daysUntilDue < 0 ? `Overdue` : `${daysUntilDue} days`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* PAYMENT HISTORY - If paid */}
        {fee.paid && (
          <div className="bg-white p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Paid:</strong> Yes
              </p>
              <p>
                <strong>Payment Date:</strong>{" "}
                {fee.updatedAt
                  ? new Intl.DateTimeFormat("en-US").format(fee.updatedAt)
                  : "N/A"}
              </p>
              <p>
                <strong>Payment Method:</strong>{" "}
                {fee.paymentMethod || "Not specified"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleFeePage;
