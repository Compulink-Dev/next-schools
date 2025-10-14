//@ts-nocheck
"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  AssignmentSchema,
  type ResultSchema,
  type LessonSchema,
  type AttendanceSchema,
  type EventSchema, 
  type AnnouncementSchema,// Import EventSchema
  type MessageSchema,
  type ParentSchema,

} from "./formValidationSchemas";
import prisma from "./prisma";
import { clerkClient } from "@clerk/nextjs/server";
import { Day } from "@prisma/client"; // Import the Day enum
import { gradeSchema, GradeSchema } from "../../lib/formValidationSchemas";

type CurrentState = { success: boolean; error: boolean };

// Create Subject - FIXED for MongoDB
export const createSubject = async (data: SubjectSchema) => {
  try {
    console.log("📌 Creating subject with data:", data);
    
    // First create the subject
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
      },
    });

    // Then create the teacher-subject relationships
    if (data.teachers && data.teachers.length > 0) {
      await prisma.teacherSubject.createMany({
        data: data.teachers.map(teacherId => ({
          teacherId, // Keep as string (ObjectId)
          subjectId: subject.id, // Keep as string (ObjectId)
        })),
      });
    }

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error creating subject:", err);
    return { success: false, error: true };
  }
};

// Update Subject - FIXED for MongoDB
export const updateSubject = async (data: SubjectSchema) => {
  console.log("🛠️ Backend: updateSubject called with:", data);

  try {
    // First update the subject name
    await prisma.subject.update({
      where: { id: data.id },
      data: {
        name: data.name,
      },
    });

    // Then update the teacher relationships
    if (data.teachers) {
      // First, remove all existing teacher relationships for this subject
      await prisma.teacherSubject.deleteMany({
        where: { subjectId: data.id },
      });

      // Then add the new relationships
      if (data.teachers.length > 0) {
        await prisma.teacherSubject.createMany({
          data: data.teachers.map(teacherId => ({
            teacherId, // Keep as string (ObjectId)
            subjectId: data.id, // Keep as string (ObjectId)
          })),
        });
      }
    }

    console.log("✅ Backend: Subject updated successfully");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Backend: Error updating subject:", err);
    return { success: false, error: true };
  }
};

// Delete Subject - FIXED for MongoDB
export const deleteSubject = async (data: { id: string }) => {
  const id = data.id;

  if (!id) {
    console.warn("⚠️ Invalid subject ID:", id);
    return { success: false, error: true };
  }

  try {
    console.log("🗑️ Deleting subject with ID:", id);

    await prisma.subject.delete({
      where: { id: id }, // Use string ID directly
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error deleting subject:", err);
    return { success: false, error: true };
  }
};


// In lib/actions.ts
export const createClass = async (
  _currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.create({
      data: {
        name: data.name,
        capacity: data.capacity,
        supervisorId: data.supervisorId || null, // Keep as string
        gradeId: data.gradeId, // Keep as string
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating class:", err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  _currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id, // Use string ID directly
      },
      data: {
        name: data.name,
        capacity: data.capacity,
        supervisorId: data.supervisorId || null, // Keep as string
        gradeId: data.gradeId, // Keep as string
      },
    });

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating class:", err);
    return { success: false, error: true };
  }
};

// Delete Class
export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
await prisma.class.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting class:", err);
    return { success: false, error: true };
  }
};

// Create Teacher
// lib/actions.ts
export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      emailAddress: [data.email],
      firstName: data.name,
      lastName: data.surname,
      publicMetadata: { role: "teacher" },
    });

    await prisma.teacher.create({
      data: {
        clerkId: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
              create: data.subjects?.map((subjectId: string) => ({
                subject: { connect: { id: subjectId } },
              })) || [],
            },

      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false, errorMessage: null };
  } catch (err: any) {
    console.error("Error creating teacher:", err);
    
    // Handle specific Prisma errors
    if (err.code === 'P2002') {
      if (err.meta?.target?.includes('phone')) {
        return { 
          success: false, 
          error: true, 
          errorMessage: 'Phone number already exists. Please use a different phone number.' 
        };
      }
      if (err.meta?.target?.includes('email')) {
        return { 
          success: false, 
          error: true, 
          errorMessage: 'Email already exists. Please use a different email.' 
        };
      }
      if (err.meta?.target?.includes('username')) {
        return { 
          success: false, 
          error: true, 
          errorMessage: 'Username already exists. Please use a different username.' 
        };
      }
    }
    
    return { 
      success: false, 
      error: true, 
      errorMessage: 'An unexpected error occurred. Please try again.' 
    };
  }
};

// Update Teacher
export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      emailAddress: [data.email],
      firstName: data.name,
      lastName: data.surname,
    });

       // First, get the current teacher to find existing subject connections
    const currentTeacher = await prisma.teacher.findUnique({
      where: { clerkId: data.id },
      include: { subjects: true },
    });

    // Get current subject IDs
    const currentSubjectIds = currentTeacher?.subjects.map(sub => sub.subjectId) || [];

    // Determine which subjects to connect and disconnect
    const subjectsToConnect = data.subjects?.filter(id => !currentSubjectIds.includes(id)) || [];
    const subjectsToDisconnect = currentSubjectIds.filter(id => !data.subjects?.includes(id)) || [];

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          // Delete disconnected subjects
          deleteMany: subjectsToDisconnect.map(subjectId => ({
            subjectId: subjectId,
          })),
          // Create new connections
          create: subjectsToConnect.map(subjectId => ({
            subject: { connect: { id: subjectId } },
          })),
        },
      },
    });
    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating teacher:", err);
    return { success: false, error: true };
  }
};

// Delete Teacher
export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting teacher:", err);
    return { success: false, error: true };
  }
};

// Create Student
export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity === classItem._count.students) {
      return { success: false, error: true };
    }

    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: [data.email], // Change this line
      publicMetadata: { role: "student" },
    });

    await prisma.student.create({
      data: {
        clerkId: user.id, // Add this line - use clerkId field
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating student:", err);
    return { success: false, error: true };
  }
};

// Update Student
export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    const user = await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
      emailAddress: [data.email], // Add this line
    });

    await prisma.student.update({
      where: {
        clerkId: data.id, // Change this to use clerkId instead of id
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        parentId: data.parentId,
      },
    });
    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating student:", err);
    return { success: false, error: true };
  }
};

// Delete Student
export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await clerkClient.users.deleteUser(id);

    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting student:", err);
    return { success: false, error: true };
  }
};
//create exam
export const createExam = async (data: ExamSchema) => {
  try {
    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating exam:", err);
    return { success: false, error: true };
  }
};
// update exam
export const updateExam = async (data: ExamSchema) => {
  console.log("🔄 Attempting to update exam with data:", data);

  if (data.id === undefined) {
    console.warn("⚠️ No exam ID provided for update.");
    return { success: false, error: true };
  }

  try {
    console.log("📦 Calling prisma.exam.update...");
    await prisma.exam.update({
      where: { id: data.id },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    console.log("✅ Update successful, revalidating path...");
    revalidatePath("/list/exams");

    console.log("🚀 Revalidation done, returning success.");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error updating exam:", err);
    return { success: false, error: true };
  }
};
//delete exam
export const deleteExam = async (form: FormData) => {

  const id = form.get("id");

  if (typeof id !== "string" || isNaN(Number(id))) {
    console.warn("❌ [deleteExam] Invalid exam ID received for deletion:", id);
    return { success: false, error: true };
  }

  console.log("🧹 [deleteExam] Attempting to delete exam with ID:", id);

  try {
await prisma.exam.delete({
      where: { id: id },
    });

    console.log("✅ [deleteExam] Deleted exam with ID:", id);
    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ [deleteExam] Failed to delete exam:", err);
    return { success: false, error: true };
  }
};

//create assignment
export const createAssignment = async (data: {
  title: string;
  startDate: Date;
  dueDate: Date;
  lessonId: string;
}) => {
  try {
    await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, message: "Assignment created successfully." };
  } catch (err) {
    console.error("Error creating assignment:", err);
    return { success: false, message: "Failed to create assignment." };
  }
};
//update assignment
export const updateAssignment = async (data: {
  id: string;
  title: string;
  startDate: Date;
  dueDate: Date;
  lessonId: string;
}) => {
  try {
await prisma.assignment.update({
      where: { id: data.id as any },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
    });

    revalidatePath("/list/assignments");
    return { success: true, message: "Assignment updated successfully." };
  } catch (err) {
    console.error("Error updating assignment:", err);
    return { success: false, message: "Failed to update assignment." };
  }
};

//delete assignment
export const deleteAssignment = async (
  _: any,
  data: FormData
): Promise<{ success: boolean; error: boolean }> => {
  console.log("🧾 [deleteAssignment] Invoked.");

  const id = data.get("id");

  console.log("📦 [deleteAssignment] FormData received:", Object.fromEntries(data.entries()));
  console.log("🔍 [deleteAssignment] Extracted ID:", id);

  if (!id) {
    console.warn("⚠️ [deleteAssignment] No ID found in FormData.");
    return { success: false, error: true };
  }

  try {
    console.log("🗑️ [deleteAssignment] Attempting to delete assignment with ID:", id);

await prisma.assignment.delete({
      where: { id: id as string },
    });

    console.log("✅ [deleteAssignment] Deletion successful. Revalidating path...");

    revalidatePath("/list/assignments");

    console.log("🔄 [deleteAssignment] Path revalidated: /list/assignments");

    return { success: true, error: false };
  } catch (err) {
    console.error("❌ [deleteAssignment] Error during deletion:", err);
    return { success: false, error: true };
  }
};

// Delete Event
export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
await prisma.event.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/events"); // Adjust the path as needed
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting event:", err);
    return { success: false, error: true };
  }
};

// Delete Announcement
export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
await prisma.announcement.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/announcements"); // Adjust the path as needed
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting announcement:", err);
    return { success: false, error: true };
  }
};

// Update Result
export const updateResult = async (
  _currentState: CurrentState, // not used, but required by useFormState
  data: ResultSchema
): Promise<{ success: boolean; error: boolean }> => {
  try {
    // Log input to confirm correct structure
    console.log("📨 updateResult received:", data);

    // Validate required fields
    if (!data.id || data.score == null) {
      console.warn("⚠️ Invalid data for result update:", data);
      return { success: false, error: true };
    }

    // Perform update
    await prisma.result.update({
      where: { id: data.id },
      data: {
        score: data.score,
      },
    });

    console.log("✅ Result updated");
    return { success: true, error: false };
  } catch (err) {
    console.error("❌ Error updating result:", err);
    return { success: false, error: true };
  }
};


// Delete Result (if needed)
export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
await prisma.result.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting result:", err);
    return { success: false, error: true };
  }
};
// Create Lesson
export const createLesson = async (
  _currentState: CurrentState,
  data: LessonSchema
) => {
  try {
    await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime, // Use the Date object directly
        endTime: data.endTime,     // Use the Date object directly
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    //revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating lesson:", err);
    return { success: false, error: true };
  }
};

// Update Lesson
export const updateLesson = async (
  _currentState: CurrentState,
  data: LessonSchema
): Promise<{ success: boolean; error: boolean }> => { 
  try {
    await prisma.lesson.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: data.startTime, // Use the Date object directly
        endTime: data.endTime,     // Use the Date object directly
        subjectId: data.subjectId,
        classId: data.classId,
        teacherId: data.teacherId,
      },
    });

    
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating lesson:", err);
    return { success: false, error: true };
  }
};

// Delete Lesson
export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
await prisma.lesson.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting lesson:", err);
    return { success: false, error: true };
  }
};

// Create Attendance
export const createAttendance = async (
  currentState: CurrentState, // If not used, consider removing this parameter
  data: AttendanceSchema
): Promise<{ success: boolean; error: boolean }> => { // Specify return type
  try {
    await prisma.attendance.create({
      data: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        date: data.date,
        present: data.present,
      },
    });

    revalidatePath("/list/attendances");
    return { success: true, error: false }; // Ensure to return the correct structure
  } catch (err) {
    console.error("Error creating attendance:", err);
    return { success: false, error: true }; // Return error structure
  }
};

// Update Attendance
export const updateAttendance = async (
  currentState: CurrentState, // If not used, consider removing
  data: AttendanceSchema
): Promise<{ success: boolean; error: boolean }> => { // Specify return type
  try {
    await prisma.attendance.update({
      where: { id: data.id },
      data: {
        studentId: data.studentId,
        lessonId: data.lessonId,
        date: data.date,
        present: data.present,
      },
    });

    return { success: true, error: false }; // Ensure to return the correct structure
  } catch (err) {
    console.error("Error updating attendance:", err);
    return { success: false, error: true }; // Return error structure
  }
};

// Delete Attendance
export const deleteAttendance = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
await prisma.attendance.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/attendances");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting attendance:", err);
    return { success: false, error: true };
  }
};

// Create Event
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
       classId: data.classId ?? null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating event:", err);
    return { success: false, error: true };
  }
};

// Update Event
export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId ?? null,
      },
    });

    revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating event:", err);
    console.log("errrttt")
    return { success: false, error: true };
  }
};

// Create Announcement
export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating announcement:", err);
    return { success: false, error: true };
  }
};

// Update Announcement
export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId ?? null,
      },
    });

    revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating announcement:", err);
    return { success: false, error: true };
  }
};
// Create Message
export const createMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    await prisma.message.create({
      data: {
        title: data.title,
        content: data.content,
        senderId: data.senderId,
        senderType: data.senderType,
        receiverId: data.receiverId,
        receiverType: data.receiverType,
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating message:", err);
    return { success: false, error: true };
  }
};

// Update Message
export const updateMessage = async (
  currentState: CurrentState,
  data: MessageSchema
) => {
  try {
    await prisma.message.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        content: data.content,
        senderId: data.senderId,
        senderType: data.senderType,
        receiverId: data.receiverId,
        receiverType: data.receiverType,
      },
    });

    revalidatePath("/list/messages");
    
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating message:", err);
    return { success: false, error: true };
  }
};

// Delete Message
export const deleteMessage = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
await prisma.message.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/messages");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting message:", err);
    return { success: false, error: true };
  }
};

// Create Parent
export const createParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  try {
    // 1. Create a user in Clerk
    const user = await clerkClient.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      emailAddress: [data.email],
      publicMetadata: { role: "parent" },
    });

    // 2. Create the parent record in your database
    await prisma.parent.create({
      data: {
        clerkId: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating parent:", err);
    return { success: false, error: true };
  }
};

// Update Parent
export const updateParent = async (
  currentState: CurrentState,
  data: ParentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }

  try {
    // 1. Update the user in Clerk
    await clerkClient.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }), // Update password if provided
      firstName: data.name,
      lastName: data.surname,
      emailAddress: [data.email],
    });

    // 2. Update the parent record in the database
    await prisma.parent.update({
      where: {
        clerkId: data.id, 
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone,
        address: data.address,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating parent:", err);
    return { success: false, error: true };
  }
};

// Delete Parent
export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  try {
    // 1. Delete the user from Clerk
    await clerkClient.users.deleteUser(id);

    // 2. Delete the parent record from the database
    await prisma.parent.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/list/parents");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting parent:", err);
    return { success: false, error: true };
  }
};

// Fees management
export type FeeSchema = {
  id?: string;
  title: string;
  amount: number;
  dueDate: Date;
  classId?: string;
  studentId?: string;
  status?: "PENDING" | "PAID" | "PARTIAL";
};

export const createFee = async (_: any, data: FeeSchema) => {
  try {
    await prisma.fee.create({
      data: {
        title: data.title,
        amount: data.amount,
        dueDate: data.dueDate,
        status: (data.status as any) ?? "PENDING",
        classId: data.classId ?? null,
        studentId: data.studentId ?? null,
      },
    });
    revalidatePath("/list/fees");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating fee:", err);
    return { success: false, error: true };
  }
};

export const updateFee = async (_: any, data: FeeSchema) => {
  try {
    if (!data.id) return { success: false, error: true };
    await prisma.fee.update({
      where: { id: data.id },
      data: {
        title: data.title,
        amount: data.amount,
        dueDate: data.dueDate,
        status: (data.status as any) ?? undefined,
        classId: data.classId ?? null,
        studentId: data.studentId ?? null,
      },
    });
    revalidatePath("/list/fees");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error updating fee:", err);
    return { success: false, error: true };
  }
};

export const deleteFee = async (_: any, data: FormData) => {
  const id = data.get("id") as string;
  try {
    await prisma.fee.delete({ where: { id } });
    revalidatePath("/list/fees");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error deleting fee:", err);
    return { success: false, error: true };
  }
};


export const createGrade = async (prevState: any, formData: FormData) => {
  // Extract data from FormData
  const rawData = {
    level: formData.get('level') as string,
    description: formData.get('description') as string,
  };

  const validatedFields = gradeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: true,
      message: 'Invalid fields: ' + validatedFields.error.errors.map(e => e.message).join(', '),
    };
  }

  const { level, description } = validatedFields.data;

  try {
    // Check if grade level already exists
    const existingGrade = await prisma.grade.findUnique({
      where: { level: Number(level) },
    });

    if (existingGrade) {
      return {
        success: false,
        error: true,
        message: `Grade ${level} already exists!`,
      };
    }

    await prisma.grade.create({
      data: {
        level: Number(level),
        description,
      },
    });

    revalidatePath('/list/grades');
    return {
      success: true,
      error: false,
      message: 'Grade created successfully!',
    };
  } catch (error) {
    console.error('Error creating grade:', error);
    return {
      success: false,
      error: true,
      message: 'Failed to create grade. Please try again.',
    };
  }
};

export const updateGrade = async (prevState: any, formData: FormData) => {
  // Extract data from FormData
  const rawData = {
    id: formData.get('id') as string,
    level: formData.get('level') as string,
    description: formData.get('description') as string,
  };

  const validatedFields = gradeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: true,
      message: 'Invalid fields: ' + validatedFields.error.errors.map(e => e.message).join(', '),
    };
  }

  const { id, level, description } = validatedFields.data;

  try {
    // Check if another grade with the same level exists (excluding current grade)
    const existingGrade = await prisma.grade.findFirst({
      where: {
        level: Number(level),
        NOT: { id },
      },
    });

    if (existingGrade) {
      return {
        success: false,
        error: true,
        message: `Grade ${level} already exists!`,
      };
    }

    await prisma.grade.update({
      where: { id },
      data: {
        level: Number(level),
        description,
      },
    });

    revalidatePath('/list/grades');
    return {
      success: true,
      error: false,
      message: 'Grade updated successfully!',
    };
  } catch (error) {
    console.error('Error updating grade:', error);
    return {
      success: false,
      error: true,
      message: 'Failed to update grade. Please try again.',
    };
  }
};

export const deleteGrade = async (prevState: any, formData: FormData) => {
  const id = formData.get('id') as string;

  try {
    // Check if grade has classes or students before deleting
    const gradeWithRelations = await prisma.grade.findUnique({
      where: { id },
      include: {
        classes: true,
        students: true,
      },
    });

    if (!gradeWithRelations) {
      return {
        success: false,
        error: true,
        message: 'Grade not found!',
      };
    }

    if (gradeWithRelations.classes.length > 0 || gradeWithRelations.students.length > 0) {
      return {
        success: false,
        error: true,
        message: 'Cannot delete grade with existing classes or students. Please reassign them first.',
      };
    }

    await prisma.grade.delete({
      where: { id },
    });

    revalidatePath('/list/grades');
    return {
      success: true,
      error: false,
      message: 'Grade deleted successfully!',
    };
  } catch (error) {
    console.error('Error deleting grade:', error);
    return {
      success: false,
      error: true,
      message: 'Failed to delete grade. Please try again.',
    };
  }
};