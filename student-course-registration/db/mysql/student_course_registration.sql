-- MySQL schema for Student Course Registration (3NF)
-- Compatible with XAMPP (MySQL/MariaDB). Import via phpMyAdmin.

DROP DATABASE IF EXISTS `student_course_registration`;
CREATE DATABASE `student_course_registration` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `student_course_registration`;

-- Ensure InnoDB for FK support
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 3NF: entities are independent, attributes fully dependent on keys, domains normalized
CREATE TABLE `students` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_students_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `courses` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(32) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `credits` SMALLINT UNSIGNED DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_courses_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Domain/lookup table for enrollment statuses
CREATE TABLE `enrollment_statuses` (
  `code` VARCHAR(32) NOT NULL,
  PRIMARY KEY (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `enrollments` (
  `id` CHAR(36) NOT NULL,
  `student_id` CHAR(36) NOT NULL,
  `course_id` CHAR(36) NOT NULL,
  `status_code` VARCHAR(32) NOT NULL,
  `enrolled_on` DATE NOT NULL,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_enrollment_student_course` (`student_id`,`course_id`),
  KEY `idx_enrollments_student` (`student_id`),
  KEY `idx_enrollments_course` (`course_id`),
  KEY `idx_enrollments_status` (`status_code`),
  CONSTRAINT `fk_enrollments_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollments_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_enrollments_status` FOREIGN KEY (`status_code`) REFERENCES `enrollment_statuses`(`code`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Seed lookup values
INSERT INTO `enrollment_statuses` (`code`) VALUES ('active'), ('completed'), ('dropped')
ON DUPLICATE KEY UPDATE `code` = VALUES(`code`);

-- Seed 7 example courses
INSERT INTO `courses` (`id`,`code`,`title`,`credits`) VALUES
  (UUID(),'CSC101','Intro to Computer Science',3),
  (UUID(),'MAT201','Discrete Mathematics',4),
  (UUID(),'PHY101','Physics I',4),
  (UUID(),'ENG102','Academic Writing',2),
  (UUID(),'HIS210','World History',3),
  (UUID(),'CSC202','Data Structures',4),
  (UUID(),'STA150','Statistics I',3)
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`), `credits` = VALUES(`credits`);

-- Optionally seed two example students (comment out if undesired)
-- INSERT INTO `students` (`id`,`name`,`email`) VALUES
--   (UUID(),'Alice Johnson','alice@student.edu'),
--   (UUID(),'Bob Lee','bob@student.edu')
-- ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Optionally seed example enrollments (requires the student/course ids). Example pattern:
-- INSERT INTO enrollments (`id`,`student_id`,`course_id`,`status_code`,`enrolled_on`,`notes`)
-- SELECT UUID(), s.id, c.id, 'active', CURDATE(), 'Seeded enrollment'
-- FROM students s CROSS JOIN courses c
-- WHERE s.email='alice@student.edu' AND c.code='CSC101'
-- LIMIT 1;
