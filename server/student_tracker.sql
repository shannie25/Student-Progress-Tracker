CREATE DATABASE IF NOT EXISTS student_tracker;

USE student_tracker;

CREATE TABLE IF NOT EXISTS users (
  id        VARCHAR(40)  PRIMARY KEY,
  email     VARCHAR(100) NOT NULL UNIQUE,
  firstname VARCHAR(100),
  lastname  VARCHAR(100),
  name      VARCHAR(180),
  role      VARCHAR(20)  NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  password  VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS student_profile (
  student_id  VARCHAR(40) PRIMARY KEY,
  grade_level INT,
  section     VARCHAR(50),
  FOREIGN KEY (student_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_profile (
  teacher_id  VARCHAR(40) PRIMARY KEY,
  department  VARCHAR(100),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS admin_profile (
  admin_id     VARCHAR(40) PRIMARY KEY,
  access_level INT DEFAULT 1,
  FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
  subject_id   INT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(100) NOT NULL,
  teacher_id   VARCHAR(40),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(40)  NOT NULL UNIQUE,
  name        VARCHAR(120) NOT NULL,
  description VARCHAR(255) DEFAULT '',
  schedule    VARCHAR(255) DEFAULT '',
  school_year VARCHAR(20)  NOT NULL DEFAULT '2025-2026',
  semester    VARCHAR(40)  NOT NULL DEFAULT '1st Semester',
  teacher_id  VARCHAR(40),
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (teacher_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS teacher_assignments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  teacher_id  VARCHAR(40)  NOT NULL,
  student_id  VARCHAR(40)  NOT NULL,
  subject     VARCHAR(100) NOT NULL,
  course      VARCHAR(100) DEFAULT '',
  section     VARCHAR(50)  DEFAULT '',
  school_year VARCHAR(20)  NOT NULL DEFAULT '2025-2026',
  semester    VARCHAR(40)  NOT NULL DEFAULT '1st Semester',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_teacher_assignment (teacher_id, student_id, subject, school_year, semester),
  FOREIGN KEY (teacher_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grades (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  student_id  VARCHAR(40) NOT NULL,
  subject_id  INT,
  subject     VARCHAR(100),
  teacher_id  VARCHAR(40),
  score       DECIMAL(5,2) NOT NULL,
  feedback    TEXT,
  school_year VARCHAR(20) NOT NULL DEFAULT '2025-2026',
  semester    VARCHAR(40) NOT NULL DEFAULT '1st Semester',
  term        VARCHAR(40) NOT NULL DEFAULT 'Prelim',
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(subject_id),
  FOREIGN KEY (teacher_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS attendance (
  log_id     INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(40) NOT NULL,
  log_date   DATE        NOT NULL,
  status     VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  FOREIGN KEY (student_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS grade_scales (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  label       VARCHAR(20) NOT NULL UNIQUE,
  min_score   DECIMAL(5,2) NOT NULL,
  max_score   DECIMAL(5,2) NOT NULL,
  description VARCHAR(255) DEFAULT '',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_grade_scale_range (min_score, max_score)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
  log_id     INT AUTO_INCREMENT PRIMARY KEY,
  admin_id   VARCHAR(40),
  action     VARCHAR(50)  NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id  VARCHAR(80)  NOT NULL,
  old_value  TEXT,
  new_value  TEXT,
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO users (id, email, firstname, lastname, name, role, password) VALUES
('1001', 'admin@school.com', 'System', 'Admin', 'System Admin', 'admin', 'p2$120000$g-FwUFfeObgjSZKigpCeoQ$xvqD_slXCVyxFpVxgbGWx30aPNtXztkNLDcTxioPolc'),
('2001', 'teacher@school.com', 'Maria', 'Reyes', 'Maria Reyes', 'teacher', 'p2$120000$JHsHWYbNFyNfw8QiCjxgIQ$jkhrmkxHY9fKv3gMahcYvYzpcRUq4o591p9WvmYfhEE'),
('3001', 'student@school.com', 'John', 'Doe', 'John Doe', 'student', 'p2$120000$H6zPYan07cyqNOLwtF7-og$BTiltGHykxvl6DuSraw8ZsSd_tDtYlUcQVQmxlrtPuo')
ON DUPLICATE KEY UPDATE email = VALUES(email), name = VALUES(name), role = VALUES(role);

INSERT INTO admin_profile (admin_id, access_level) VALUES ('1001', 1)
ON DUPLICATE KEY UPDATE access_level = VALUES(access_level);

INSERT INTO teacher_profile (teacher_id, department) VALUES ('2001', 'Science and Math')
ON DUPLICATE KEY UPDATE department = VALUES(department);

INSERT INTO student_profile (student_id, grade_level, section) VALUES ('3001', 10, 'Section A')
ON DUPLICATE KEY UPDATE grade_level = VALUES(grade_level), section = VALUES(section);

INSERT INTO subjects (subject_name, teacher_id) VALUES
('Mathematics', '2001'),
('Science', '2001');

INSERT INTO courses (code, name, description, teacher_id) VALUES
('MATH10', 'Mathematics 10', 'Core mathematics course', '2001'),
('SCI10', 'Science 10', 'Core science course', '2001')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), teacher_id = VALUES(teacher_id);

INSERT INTO teacher_assignments (teacher_id, student_id, subject, course, section, school_year, semester) VALUES
('2001', '3001', 'Mathematics', 'MATH10', 'Section A', '2025-2026', '1st Semester'),
('2001', '3001', 'Science', 'SCI10', 'Section A', '2025-2026', '1st Semester')
ON DUPLICATE KEY UPDATE course = VALUES(course), section = VALUES(section);

INSERT INTO grades (student_id, subject_id, subject, teacher_id, score, feedback, school_year, semester, term) VALUES
('3001', 1, 'Mathematics', '2001', 85.00, 'Excellent work on problem solving.', '2025-2026', '1st Semester', 'Prelim'),
('3001', 2, 'Science', '2001', 92.00, 'Consistent performance and strong lab output.', '2025-2026', '1st Semester', 'Midterm');

INSERT INTO attendance (student_id, log_date, status) VALUES
('3001', '2026-01-08', 'present'),
('3001', '2026-01-09', 'late'),
('3001', '2026-01-10', 'present'),
('3001', '2026-01-13', 'absent');

INSERT INTO grade_scales (label, min_score, max_score, description) VALUES
('A', 90, 100, 'Excellent mastery'),
('B', 80, 89.99, 'Above average performance'),
('C', 75, 79.99, 'Passing performance'),
('F', 0, 74.99, 'Needs remediation');
