import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: String(id) }
        : { classId: String(id) }), // ✅ fixed type mismatch
    },
  });

  const data = dataRes.map((lesson) => ({
    title: lesson.name,
    start: new Date(lesson.startTime), // ✅ ensure Date
    end: new Date(lesson.endTime), // ✅ ensure Date
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
