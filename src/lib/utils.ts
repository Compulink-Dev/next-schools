import { clsx, type ClassValue } from "clsx"
import { addDays, startOfWeek, set } from "date-fns";
import { twMerge } from "tailwind-merge"


type Event = {
  title: string;
  start: Date | string;
  end: Date | string;
};


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function adjustScheduleToCurrentWeek(
  events: { title: string; start: Date | string; end: Date | string }[]
): { title: string; start: Date; end: Date }[] {
  return events.map((event) => ({
    ...event,
    start: new Date(event.start), // ensure Date
    end: new Date(event.end),     // ensure Date
  }));
}
