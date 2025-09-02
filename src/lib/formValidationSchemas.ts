import { z } from "zod";
import { assignmentsData } from "./data";

// subjectSchema.ts
export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()).min(1, { message: "Select at least one teacher." }),
});

export type SubjectSchema = z.infer<typeof subjectSchema>;


// Class Schema
export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

// Teacher Schema
export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

// Student Schema
export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

//exam shema

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.string().min(1, { message: "Start time is required!" }).transform(str => new Date(str)),
  endTime: z.string().min(1, { message: "End time is required!" }).transform(str => new Date(str)),
  lessonId: z.string().min(1, { message: "Lesson is required!" }).transform(str => Number(str)),
});

export type ExamSchema = z.infer<typeof examSchema>;


export const assignmentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  startDate: z.string().min(1, "Start date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  lessonId: z.string().min(1, "Lesson is required"),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

// Result Schema
export const resultSchema = z.object({
  id: z.coerce.number().optional(), // Optional for editing existing results
  score: z.coerce.number().min(0, { message: "Score must be at least 0!" }), // Editable field
  examId: z.coerce.number().optional(), // Optional for reference
  assignmentId: z.coerce.number().optional(), // Optional for reference
  studentId: z.string().min(1, { message: "Student ID is required!" }), // Read-only
});

export type ResultSchema = z.infer<typeof resultSchema>;

// Lesson Schema
export const lessonSchema = z.object({
  id: z.coerce.number().optional(), // Optional for updates
  name: z.string().min(1, { message: "Lesson name is required!" }), // Matches 'name' in Prisma
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], { 
    message: "Day of the week is required!" 
  }), // Matches 'day' in Prisma
  startTime: z.coerce.date({ message: "Start time is required!" }), // Matches 'startTime'
  endTime: z.coerce.date({ message: "End time is required!" }), // Matches 'endTime'
  subjectId: z.coerce.number({ message: "Subject ID is required!" }), // Matches 'subjectId'
  classId: z.coerce.number({ message: "Class ID is required!" }), // Matches 'classId'
  teacherId: z.string({ message: "Teacher ID is required!" }), // Matches 'teacherId'
});

export type LessonSchema = z.infer<typeof lessonSchema>;
//attendance schema

export const attendanceSchema = z.object({
  id: z.coerce.number().optional(),
  studentId: z.string({ required_error: "Student is required" }),
  lessonId: z.coerce.number({ required_error: "Lesson is required" }),
  date: z.coerce.date({ required_error: "Date is required" }),
  present: z.boolean().optional().default(false), // Optional and default to false
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

// Event Schema
export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string({ required_error: "Title is required" }),
  description: z.string({ required_error: "Description is required" }),
  startTime: z.coerce.date({ required_error: "Start Time is required" }),
  endTime: z.coerce.date({ required_error: "End Time is required" }),
  classId: z.coerce.number().optional().nullable(), // Optional and nullable
});

export type EventSchema = z.infer<typeof eventSchema>;

// Announcement Schema
export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string({ required_error: "Title is required" }),
  description: z.string({ required_error: "Description is required" }),
  date: z.coerce.date({ required_error: "Date is required" }),
  classId: z.coerce.number().optional().nullable(), // Optional and nullable
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const messageSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  senderId: z.string().min(1, { message: "Sender ID is required" }),
  senderType: z.enum(["TEACHER", "STUDENT", "ADMIN"], { message: "Invalid sender type" }),
  receiverId: z.string().min(1, { message: "Receiver ID is required" }),
  receiverType: z.enum(["TEACHER", "STUDENT", "ADMIN"], { message: "Invalid receiver type" }),
});

export type MessageSchema = z.infer<typeof messageSchema>;

// Parent Schema
export const parentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, {
    message: "Invalid phone number",
  }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
});

export type ParentSchema = z.infer<typeof parentSchema>;