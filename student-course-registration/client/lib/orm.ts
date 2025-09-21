export type ID = string;

export type EnrollmentStatus = "active" | "completed" | "dropped";

export interface Student {
  id: ID;
  name: string;
  email: string;
}

export interface Course {
  id: ID;
  code: string; // e.g. CSC101
  title: string;
  credits?: number;
}

export interface Enrollment {
  id: ID;
  studentId: ID;
  courseId: ID;
  status: EnrollmentStatus;
  enrolledOn: string; // ISO date
  notes?: string;
}

export type CreateEnrollmentInput = Omit<Enrollment, "id">;
export type UpdateEnrollmentInput = Partial<Omit<Enrollment, "id">> & {
  id: ID;
};

function uid(): ID {
  // Browser crypto.randomUUID when available, fallback to timestamp-rand
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

class InMemoryDB {
  students: Student[] = [];
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
}

export class ORM {
  private static STORAGE_KEY = "scr.orm.v1";
  db: InMemoryDB;
  constructor(seed = true) {
    this.db = new InMemoryDB();
    // Try to hydrate from localStorage if available
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(ORM.STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (
            parsed &&
            Array.isArray(parsed.students) &&
            Array.isArray(parsed.courses) &&
            Array.isArray(parsed.enrollments)
          ) {
            this.db.students = parsed.students;
            this.db.courses = parsed.courses;
            this.db.enrollments = parsed.enrollments;
          } else if (seed) {
            this.seed();
            this.save();
          }
        } else if (seed) {
          this.seed();
          this.save();
        }
      } catch {
        if (seed) {
          this.seed();
          this.save();
        }
      }
    } else if (seed) {
      this.seed();
    }
  }

  private save() {
    if (typeof window === "undefined") return;
    try {
      const payload = JSON.stringify(this.db);
      window.localStorage.setItem(ORM.STORAGE_KEY, payload);
    } catch {
      // ignore write errors
    }
  }

  // Students
  listStudents(): Student[] {
    return [...this.db.students];
  }

  createStudent(input: Omit<Student, "id">): Student {
    const existing = this.db.students.find(
      (s) => s.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (existing) return existing;
    const student: Student = { id: uid(), ...input };
    this.db.students.push(student);
    this.save();
    return student;
  }

  // Courses
  listCourses(): Course[] {
    return [...this.db.courses];
  }

  createCourse(input: Omit<Course, "id">): Course {
    const course: Course = { id: uid(), ...input };
    this.db.courses.push(course);
    this.save();
    return course;
  }

  // Enrollments
  listEnrollments(): Enrollment[] {
    return [...this.db.enrollments];
  }

  createEnrollment(input: CreateEnrollmentInput): Enrollment {
    const student = this.db.students.find((s) => s.id === input.studentId);
    const course = this.db.courses.find((c) => c.id === input.courseId);
    if (!student) throw new Error("Student not found for studentId");
    if (!course) throw new Error("Course not found for courseId");
    const duplicate = this.db.enrollments.find(
      (e) => e.studentId === input.studentId && e.courseId === input.courseId,
    );
    if (duplicate) throw new Error("Student already enrolled in this course");
    const enrollment: Enrollment = { id: uid(), ...input };
    this.db.enrollments.push(enrollment);
    this.save();
    return enrollment;
  }

  updateEnrollment(input: UpdateEnrollmentInput): Enrollment {
    const idx = this.db.enrollments.findIndex((e) => e.id === input.id);
    if (idx === -1) throw new Error("Enrollment not found");
    const current = this.db.enrollments[idx];
    const next: Enrollment = { ...current, ...input } as Enrollment;
    this.db.enrollments[idx] = next;
    this.save();
    return next;
  }

  deleteEnrollment(id: ID): void {
    const before = this.db.enrollments.length;
    this.db.enrollments = this.db.enrollments.filter((e) => e.id !== id);
    if (this.db.enrollments.length === before)
      throw new Error("Enrollment not found");
    this.save();
  }

  private seed() {
    const s1: Student = {
      id: uid(),
      name: "Alice Johnson",
      email: "alice@student.edu",
    };
    const s2: Student = {
      id: uid(),
      name: "Bob Lee",
      email: "bob@student.edu",
    };
    this.db.students.push(s1, s2);

    const c1 = this.createCourse({
      code: "CSC101",
      title: "Intro to Computer Science",
      credits: 3,
    });
    const c2 = this.createCourse({
      code: "MAT201",
      title: "Discrete Mathematics",
      credits: 4,
    });
    const c3 = this.createCourse({
      code: "PHY101",
      title: "Physics I",
      credits: 4,
    });
    const c4 = this.createCourse({
      code: "ENG102",
      title: "Academic Writing",
      credits: 2,
    });
    const c5 = this.createCourse({
      code: "HIS210",
      title: "World History",
      credits: 3,
    });
    const c6 = this.createCourse({
      code: "CSC202",
      title: "Data Structures",
      credits: 4,
    });
    const c7 = this.createCourse({
      code: "STA150",
      title: "Statistics I",
      credits: 3,
    });

    this.createEnrollment({
      studentId: s1.id,
      courseId: c1.id,
      status: "active",
      enrolledOn: new Date().toISOString().slice(0, 10),
      notes: "Needs lab access",
    });

    this.createEnrollment({
      studentId: s2.id,
      courseId: c2.id,
      status: "active",
      enrolledOn: new Date().toISOString().slice(0, 10),
    });
  }
}

export const orm = new ORM();

export const ormModelTs = `
class Student { id: string; name: string; email: string }
class Course { id: string; code: string; title: string; credits?: number }
class Enrollment { id: string; studentId: string; courseId: string; status: 'active'|'completed'|'dropped'; enrolledOn: string; notes?: string }
`;

export const relationalSchemaSql = `
-- 3NF-compliant schema for Student Course Registration
-- Each non-key attribute depends on the key, the whole key, and nothing but the key.

CREATE TABLE students (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE courses (
  id UUID PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  credits INT CHECK (credits >= 0)
);

-- Lookup table for enrollment statuses (no repeating groups, eliminates update anomalies)
CREATE TABLE enrollment_statuses (
  code TEXT PRIMARY KEY
);

CREATE TABLE enrollments (
  id UUID PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE ON UPDATE CASCADE,
  status_code TEXT NOT NULL REFERENCES enrollment_statuses(code),
  enrolled_on DATE NOT NULL,
  notes TEXT,
  UNIQUE(student_id, course_id)
);

-- Helpful indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_courses_code ON courses(code);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_enrollments_status ON enrollments(status_code);

-- Seed status domain (example)
INSERT INTO enrollment_statuses(code) VALUES ('active'), ('completed'), ('dropped');
`;
