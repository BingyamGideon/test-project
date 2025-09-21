import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { orm, Course, Student, Enrollment, EnrollmentStatus } from "@/lib/orm";

export default function Index() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>(
    orm.listEnrollments(),
  );
  const courses = useMemo<Course[]>(() => orm.listCourses(), []);
  const students = orm.listStudents();
  const [filter, setFilter] = useState<EnrollmentStatus | "all">("all");

  const filtered = enrollments.filter((e) =>
    filter === "all" ? true : e.status === filter,
  );

  function handleSave(data: Omit<Enrollment, "id">, id?: string) {
    if (id) {
      const next = orm.updateEnrollment({ id, ...data });
      setEnrollments((prev) => prev.map((e) => (e.id === id ? next : e)));
    } else {
      const created = orm.createEnrollment(data);
      setEnrollments((prev) => [created, ...prev]);
    }
  }

  function handleDelete(id: string) {
    orm.deleteEnrollment(id);
    setEnrollments((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_600px_at_10%_-20%,hsl(var(--primary)/0.15),transparent),radial-gradient(1200px_600px_at_110%_-10%,hsl(var(--accent)/0.6),transparent)]">
      <main className="container mx-auto px-4">
        {/* Hero */}
        <section className="py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Student Course Registration
            </h1>
            <p className="mt-3 text-muted-foreground text-lg">
              Manage enrollments with create, read, update and delete
              operations.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <a href="#enrollments">Manage Enrollments</a>
              </Button>
            </div>
          </div>
        </section>


        {/* Enrollments CRUD */}
        <section id="enrollments" className="py-6">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Enrollments</h2>
              <p className="text-muted-foreground">
                Add, edit, filter, and delete student enrollments.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <CourseBrowserDialog
                courses={courses}
                students={students}
                enrollments={enrollments}
              >
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">All Courses</Button>
              </CourseBrowserDialog>
              <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                <SelectTrigger className="w-48 bg-purple-600 hover:bg-purple-700 text-white border-transparent">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
              <EnrollmentDialog
                courses={courses}
                students={students}
                onSave={(data) => handleSave(data)}
              >
                <Button>New Enrollment</Button>
              </EnrollmentDialog>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Course
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Enrolled On
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Notes
                      </TableHead>
                      <TableHead className="w-36">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">
                          {students.find((s) => s.id === e.studentId)?.name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {courses.find((c) => c.id === e.courseId)?.title}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                              badgeByStatus(e.status),
                            )}
                          >
                            {labelByStatus(e.status)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {e.enrolledOn}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {e.notes ?? "—"}
                        </TableCell>
                        <TableCell className="flex gap-2">
                          <EnrollmentDialog
                            courses={courses}
                            students={students}
                            initial={e}
                            onSave={(data) => handleSave(data, e.id)}
                          >
                            <Button variant="secondary" size="sm">
                              Edit
                            </Button>
                          </EnrollmentDialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(e.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

function badgeByStatus(status: EnrollmentStatus) {
  switch (status) {
    case "active":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "dropped":
      return "bg-rose-50 text-rose-700 ring-rose-200";
  }
}

function labelByStatus(status: EnrollmentStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function EnrollmentDialog({
  children,
  initial,
  courses,
  students,
  onSave,
}: {
  children: React.ReactNode;
  initial?: Enrollment;
  courses: Course[];
  students: Student[];
  onSave: (data: Omit<Enrollment, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState(
    initial?.studentId ?? students[0]?.id,
  );
  const [courseId, setCourseId] = useState(initial?.courseId ?? courses[0]?.id);
  const [status, setStatus] = useState<EnrollmentStatus>(
    initial?.status ?? "active",
  );
  const [enrolledOn, setEnrolledOn] = useState<string>(
    initial?.enrolledOn ?? new Date().toISOString().slice(0, 10),
  );
  const [notes, setNotes] = useState<string>(initial?.notes ?? "");
  const [studentName, setStudentName] = useState<string>("");

  function ensureStudentByName(name: string): string {
    const trimmed = name.trim();
    const found = orm
      .listStudents()
      .find((s) => s.name.trim().toLowerCase() === trimmed.toLowerCase());
    if (found) return found.id;
    const base = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, ".");
    const candidate = base || "student";
    const existingEmails = new Set(orm.listStudents().map((s) => s.email.toLowerCase()));
    let email = `${candidate}@student.edu`;
    let i = 1;
    while (existingEmails.has(email)) {
      email = `${candidate}${i}@student.edu`;
      i++;
    }
    const created = orm.createStudent({ name: trimmed, email });
    return created.id;
  }

  function submit() {
    if (!courseId) return;
    let effectiveStudentId = studentId;
    if (!initial) {
      if (!studentName.trim()) return;
      effectiveStudentId = ensureStudentByName(studentName);
    }
    if (!effectiveStudentId) return;
    onSave({
      studentId: effectiveStudentId,
      courseId,
      status,
      enrolledOn,
      notes: notes || undefined,
    });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Enrollment" : "New Enrollment"}
          </DialogTitle>
          <DialogDescription>
            Set the student, course, and status. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Student</label>
            {initial ? (
              <Select value={studentId} onValueChange={(v) => setStudentId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Type student full name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <Select value={courseId} onValueChange={(v) => setCourseId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as EnrollmentStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Enrolled on</label>
            <Input
              type="date"
              value={enrolledOn}
              onChange={(e) => setEnrolledOn(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{initial ? "Save" : "Create"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CourseStudentsDialog({
  children,
  course,
  students,
  enrollments,
}: {
  children: React.ReactNode;
  course: Course;
  students: Student[];
  enrollments: Enrollment[];
}) {
  const [open, setOpen] = useState(false);
  const rows = enrollments
    .filter((e) => e.courseId === course.id)
    .map((e) => ({
      e,
      s: students.find((s) => s.id === e.studentId),
    }))
    .filter((r) => Boolean(r.s));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Students in {course.code} — {course.title}</DialogTitle>
          <DialogDescription>
            Showing all students registered for this course.
          </DialogDescription>
        </DialogHeader>
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No students enrolled yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Enrolled On</TableHead>
                  <TableHead className="hidden md:table-cell">Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ e, s }) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{s!.name}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                          badgeByStatus(e.status),
                        )}
                      >
                        {labelByStatus(e.status)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{e.enrolledOn}</TableCell>
                    <TableCell className="hidden md:table-cell">{e.notes ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CourseBrowserDialog({
  children,
  courses,
  students,
  enrollments,
}: {
  children: React.ReactNode;
  courses: Course[];
  students: Student[];
  enrollments: Enrollment[];
}) {
  const [open, setOpen] = useState(false);
  const [courseId, setCourseId] = useState<string>(courses[0]?.id);
  const selected = courses.find((c) => c.id === courseId);
  const rows = useMemo(
    () =>
      enrollments
        .filter((e) => e.courseId === courseId)
        .map((e) => ({ e, s: students.find((s) => s.id === e.studentId) }))
        .filter((r) => Boolean(r.s)),
    [enrollments, courseId, students],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-[794px] sm:max-w-[794px] max-w-[95vw] max-h-[90vh] sm:h-[1123px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Courses</DialogTitle>
          <DialogDescription>
            Select a course to view registered students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Course</label>
            <Select value={courseId} onValueChange={(v) => setCourseId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selected && (
            rows.length === 0 ? (
              <div className="text-sm text-muted-foreground">No students enrolled yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Enrolled On</TableHead>
                      <TableHead className="hidden md:table-cell">Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map(({ e, s }) => (
                      <TableRow key={e.id}>
                        <TableCell className="font-medium">{s!.name}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1",
                              badgeByStatus(e.status),
                            )}
                          >
                            {labelByStatus(e.status)}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{e.enrolledOn}</TableCell>
                        <TableCell className="hidden md:table-cell">{e.notes ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
