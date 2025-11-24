import { z } from "zod";
import { assignmentsData } from "./data";

// subjectSchema.ts
export const subjectSchema = z.object({
  id: z.string().optional(), // Should be string for MongoDB
  name: z.string().min(1, "Subject name is required"),
  teachers: z.array(z.string()).optional(), // Array of strings (ObjectIds)
});

export type SubjectSchema = z.infer<typeof subjectSchema>;


// Class Schema
export const classSchema = z.object({
  id: z.string().optional(), // Should be string for MongoDB
  name: z.string().min(1, { message: "Class name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity is required!" }),
  gradeId: z.string().min(1, { message: "Grade is required!" }),
  supervisorId: z.string().optional(),
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
  gradeId: z.string().min(1, { message: "Grade is required!" }),
  classId: z.string().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

//exam shema

export const examSchema = z.object({
  id: z.string().optional(), // MongoDB ObjectId as string
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.string().min(1, { message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;


export const assignmentSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  startDate: z.coerce.date({ message: "Start date is required" }),
  dueDate: z.coerce.date({ message: "Due date is required" }),
  lessonId: z.string().min(1, "Lesson is required"),
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;

// Result Schema
export const resultSchema = z.object({
  id: z.string().optional(),
  score: z.coerce.number().min(0, { message: "Score must be at least 0!" }),
  examId: z.string().optional(),
  assignmentId: z.string().optional(),
  studentId: z.string().min(1, { message: "Student ID is required!" }),
});

export type ResultSchema = z.infer<typeof resultSchema>;

// Lesson Schema
export const lessonSchema = z.object({
  id: z.string().optional(), // Should be string for MongoDB
  name: z.string().min(1, { message: "Lesson name is required!" }), // Matches 'name' in Prisma
  day: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"], { 
    message: "Day of the week is required!" 
  }), // Matches 'day' in Prisma
  startTime: z.coerce.date({ message: "Start time is required!" }), // Matches 'startTime'
  endTime: z.coerce.date({ message: "End time is required!" }), // Matches 'endTime'
  subjectId: z.coerce.string({ message: "Subject ID is required!" }), // Matches 'subjectId'
  classId: z.coerce.string({ message: "Class ID is required!" }), // Matches 'classId'
  teacherId: z.string({ message: "Teacher ID is required!" }), // Matches 'teacherId'
});

export type LessonSchema = z.infer<typeof lessonSchema>;
//attendance schema

export const attendanceSchema = z.object({
  id: z.string().optional(),
  studentId: z.string({ required_error: "Student is required" }),
  lessonId: z.string({ required_error: "Lesson is required" }),
  date: z.coerce.date({ required_error: "Date is required" }),
  present: z.boolean().optional().default(false),
});

export type AttendanceSchema = z.infer<typeof attendanceSchema>;

// Event Schema
export const eventSchema = z.object({
  id: z.string().optional(),
  title: z.string({ required_error: "Title is required" }),
  description: z.string({ required_error: "Description is required" }),
  startTime: z.coerce.date({ required_error: "Start Time is required" }),
  endTime: z.coerce.date({ required_error: "End Time is required" }),
  classId: z
    .union([z.string().min(1), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type EventSchema = z.infer<typeof eventSchema>;

// Announcement Schema
export const announcementSchema = z.object({
  id: z.string().optional(),
  title: z.string({ required_error: "Title is required" }),
  description: z.string({ required_error: "Description is required" }),
  date: z.coerce.date({ required_error: "Date is required" }),
  classId: z
    .union([z.string().min(1), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const messageSchema = z.object({
  id: z.string().optional(), // Should be string for MongoDB
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
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
});


export type ParentSchema = z.infer<typeof parentSchema>;

// Add these to your existing formValidationSchemas.ts

export const feeSchema = z.object({
  id: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  dueDate: z.coerce.date({ required_error: "Due date is required" }),
  status: z.enum(["PENDING", "PAID", "OVERDUE"], {
    required_error: "Status is required",
  }),
  studentId: z.string().min(1, "Student is required"),
  description: z.string().optional(),
});

export const gradeSchema = z.object({
  id: z.string().optional(),
  level: z.coerce.number().min(1).max(12, "Grade level must be between 1 and 12"),
  section: z.string().min(1, "Section is required"),
  classId: z.string().optional(),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").optional(),
});

export type FeeSchema = z.infer<typeof feeSchema>;
export type GradeSchema = z.infer<typeof gradeSchema>;