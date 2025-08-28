import { Day, PrismaClient, UserSex } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.result.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.teacherSubject.deleteMany();
  await prisma.teacherClass.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.class.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.admin.deleteMany();

  // ADMIN
  await prisma.admin.create({
    data: {
      username: "admin1",
    },
  });
  await prisma.admin.create({
    data: {
      username: "admin2",
    },
  });

  // GRADE
  const grades = [];
  for (let i = 1; i <= 6; i++) {
    const grade = await prisma.grade.create({
      data: {
        level: i,
      },
    });
    grades.push(grade);
  }

  // CLASS
  const classes = [];
  for (let i = 1; i <= 6; i++) {
    const classItem = await prisma.class.create({
      data: {
        name: `${i}A`,
        gradeId: grades[i - 1].id,
        capacity: Math.floor(Math.random() * (20 - 15 + 1)) + 15,
      },
    });
    classes.push(classItem);
  }

  // SUBJECT
  const subjectData = [
    { name: "Mathematics" },
    { name: "Science" },
    { name: "English" },
    { name: "History" },
    { name: "Geography" },
    { name: "Physics" },
    { name: "Chemistry" },
    { name: "Biology" },
    { name: "Computer Science" },
    { name: "Art" },
  ];

  const subjects = [];
  for (const subject of subjectData) {
    const createdSubject = await prisma.subject.create({ data: subject });
    subjects.push(createdSubject);
  }

  // TEACHER
  const teachers = [];
  for (let i = 1; i <= 15; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        username: `teacher${i}`,
        name: `TName${i}`,
        surname: `TSurname${i}`,
        email: `teacher${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
        bloodType: "A+",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 30)),
      },
    });
    teachers.push(teacher);

    // Connect teacher to subject through junction table
    await prisma.teacherSubject.create({
      data: {
        teacherId: teacher.id,
        subjectId: subjects[(i % 10)].id,
      },
    });

    // Connect teacher to class through junction table
    await prisma.teacherClass.create({
      data: {
        teacherId: teacher.id,
        classId: classes[(i % 6)].id,
      },
    });
  }

  // LESSON
  const lessons = [];
  for (let i = 1; i <= 30; i++) {
    const lesson = await prisma.lesson.create({
      data: {
        name: `Lesson${i}`,
        day: Day[
          Object.keys(Day)[
            Math.floor(Math.random() * Object.keys(Day).length)
          ] as keyof typeof Day
        ],
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 3)),
        subjectId: subjects[(i % 10)].id,
        classId: classes[(i % 6)].id,
        teacherId: teachers[(i % 15)].id,
      },
    });
    lessons.push(lesson);
  }

  // PARENT
  const parents = [];
  for (let i = 1; i <= 25; i++) {
    const parent = await prisma.parent.create({
      data: {
        username: `parent${i}`,
        name: `PName ${i}`,
        surname: `PSurname ${i}`,
        email: `parent${i}@example.com`,
        phone: `123-456-789${i}`,
        address: `Address${i}`,
      },
    });
    parents.push(parent);
  }

  // STUDENT
  const students = [];
  for (let i = 1; i <= 50; i++) {
    const student = await prisma.student.create({
      data: {
        username: `student${i}`,
        name: `SName${i}`,
        surname: `SSurname ${i}`,
        email: `student${i}@example.com`,
        phone: `987-654-321${i}`,
        address: `Address${i}`,
        bloodType: "O-",
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        parentId: parents[Math.ceil(i / 2) % 25 || 24].id,
        gradeId: grades[(i % 6)].id,
        classId: classes[(i % 6)].id,
        birthday: new Date(new Date().setFullYear(new Date().getFullYear() - 10)),
      },
    });
    students.push(student);
  }

  // EXAM
  const exams = [];
  for (let i = 1; i <= 10; i++) {
    const exam = await prisma.exam.create({
      data: {
        title: `Exam ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        lessonId: lessons[(i % 30)].id,
      },
    });
    exams.push(exam);
  }

  // ASSIGNMENT
  const assignments = [];
  for (let i = 1; i <= 10; i++) {
    const assignment = await prisma.assignment.create({
      data: {
        title: `Assignment ${i}`,
        startDate: new Date(new Date().setHours(new Date().getHours() + 1)),
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
        lessonId: lessons[(i % 30)].id,
      },
    });
    assignments.push(assignment);
  }

  // RESULT
  for (let i = 1; i <= 10; i++) {
    await prisma.result.create({
      data: {
        score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        studentId: students[i - 1].id,
        ...(i <= 5 
          ? { examId: exams[i - 1].id } 
          : { assignmentId: assignments[i - 6].id }
        ),
      },
    });
  }

  // ATTENDANCE
  for (let i = 1; i <= 10; i++) {
    await prisma.attendance.create({
      data: {
        date: new Date(),
        present: Math.random() > 0.2, // 80% chance of being present
        studentId: students[i - 1].id,
        lessonId: lessons[(i % 30)].id,
      },
    });
  }

  // EVENT
  for (let i = 1; i <= 5; i++) {
    await prisma.event.create({
      data: {
        title: `Event ${i}`,
        description: `Description for Event ${i}`,
        startTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        endTime: new Date(new Date().setHours(new Date().getHours() + 2)),
        classId: classes[(i % 6)].id,
      },
    });
  }

  // ANNOUNCEMENT
  for (let i = 1; i <= 5; i++) {
    await prisma.announcement.create({
      data: {
        title: `Announcement ${i}`,
        description: `Description for Announcement ${i}`,
        date: new Date(),
        classId: classes[(i % 6)].id,
      },
    });
  }

  console.log("Seeding completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });