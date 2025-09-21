# Student Course Registration

A React + Express starter tailored for a Student Course Registration prototype. The UI runs with an in-memory ORM for fast demos. A production-ready, 3NF MySQL schema is included for import via XAMPP.

## What’s Included
- App UI (React) with Enrollment CRUD demo (in‑memory repository)
- MySQL 3NF schema and seed for statuses + 7 courses
  - Path: `db/mysql/student_course_registration.sql`

## Use with XAMPP (MySQL/MariaDB)

### 1) Start services
- Open XAMPP Control Panel
- Start Apache and MySQL

### 2) Import the database via phpMyAdmin
- Navigate to http://localhost/phpmyadmin
- Click Import
- Choose file: `db/mysql/student_course_registration.sql`
- Format: SQL, then click Execute

The script will:
- Drop and recreate the database `student_course_registration`
- Create tables: `students`, `courses`, `enrollment_statuses`, `enrollments`
- Seed `enrollment_statuses` with `active`, `completed`, `dropped`
- Seed 7 example courses (CSC101, MAT201, PHY101, ENG102, HIS210, CSC202, STA150)

### 3) Verify
In phpMyAdmin, select `student_course_registration` and check the `tables` tab. You should see all 4 tables with data in `courses` and `enrollment_statuses`.

### 4) Optional: seed example students/enrollments
The SQL file contains commented examples. You can either:
- Run quick inserts in phpMyAdmin > SQL:

```sql
INSERT INTO students (id, name, email) VALUES
  (UUID(), 'Alice Johnson', 'alice@student.edu'),
  (UUID(), 'Bob Lee', 'bob@student.edu');

-- Example enrollment (adjust emails/codes to match your rows)
INSERT INTO enrollments (id, student_id, course_id, status_code, enrolled_on, notes)
SELECT UUID(), s.id, c.id, 'active', CURDATE(), 'Seeded via phpMyAdmin'
FROM students s, courses c
WHERE s.email='alice@student.edu' AND c.code='CSC101'
LIMIT 1;
```
- Or open `db/mysql/student_course_registration.sql`, uncomment the example seed blocks, and re‑import.

### CLI import (alternative to phpMyAdmin)
- On Windows with XAMPP:
  - Find `mysql.exe` (e.g. `C:\\xampp\\mysql\\bin\\mysql.exe`)
  - Run in PowerShell or cmd:

```bash
"C:\xampp\mysql\bin\mysql.exe" -u root -p < db\mysql\student_course_registration.sql
```

- On macOS/Linux (if you have MySQL client installed):

```bash
mysql -u root -p < db/mysql/student_course_registration.sql
```

Default XAMPP credentials are often `root` with no password. If prompted, set or enter your own.

## Schema (3NF)
- `students(id PK, name, email UNIQUE)`
- `courses(id PK, code UNIQUE, title, credits)`
- `enrollment_statuses(code PK)` — domain table to avoid update anomalies
- `enrollments(id PK, student_id FK→students, course_id FK→courses, status_code FK→enrollment_statuses, enrolled_on, notes, UNIQUE(student_id, course_id))`
- Helpful indexes included (email, code, FKs)

## Using the App UI
The current UI uses an in‑memory repository (no DB connection). The MySQL schema is provided for production readiness.

If you want to wire the UI to MySQL:
- Create server endpoints in `server/` that use a DB client (e.g. `mysql2` or Prisma) and map to the schema above
- Replace in‑memory calls in the client with `fetch` calls to your server endpoints

## Resetting the DB
Re‑import `db/mysql/student_course_registration.sql` to reset to a clean state.

## Troubleshooting
- If FK errors occur, ensure tables engine is InnoDB (script sets it) and you imported the schema before inserts
- MariaDB/MySQL support `UUID()`; if disabled, replace with client‑generated UUIDs
- If phpMyAdmin upload limit is low, zip the SQL or increase `upload_max_filesize` and `post_max_size` in `php.ini`
