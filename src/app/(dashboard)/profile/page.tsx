import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export default async function Profile() {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  let userDetails: any = null;
  let results: any[] = [];

  if (role === "student") {
    userDetails = await prisma.student.findUnique({ where: { id: userId! } });
    results = await prisma.result.findMany({
      where: { studentId: userId! },
      include: { exam: true, assignment: true },
      orderBy: { id: "desc" },
      take: 10,
    });
  } else if (role === "teacher") {
    userDetails = await prisma.teacher.findUnique({ where: { id: userId! } });
  } else if (role === "parent") {
    userDetails = await prisma.parent.findUnique({ where: { id: userId! } });
  } else if (role === "admin") {
    userDetails = await prisma.admin.findFirst();
  }

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold mb-4">Profile</h1>
      {userDetails ? (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {Object.entries(userDetails).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b py-1">
                <span className="text-gray-500">{k}</span>
                <span className="font-medium">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No profile details available.</div>
      )}

      {role === "student" && (
        <div>
          <h2 className="text-md font-semibold mb-2">Recent Test Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Type</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b">
                    <td className="py-2">{r.examId ? "Exam" : "Assignment"}</td>
                    <td className="py-2">{r.exam?.title || r.assignment?.title}</td>
                    <td className="py-2">{r.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
