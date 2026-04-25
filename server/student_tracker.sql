CREATE DATABASE student_tracker;

USE student_tracker;

CREATE TABLE users (
  id VARCHAR(10) PRIMARY KEY,
  email VARCHAR(100),
  name VARCHAR(100),
  role VARCHAR(20),
  password VARCHAR(100)
) ENGINE=InnoDB;

CREATE TABLE grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(10),
  subject VARCHAR(50),
  score INT,
  feedback TEXT,
  FOREIGN KEY (student_id) REFERENCES users(id)
) ENGINE=InnoDB;

INSERT INTO users (id, email, name, role, password) VALUES
('1001', 'admin@school.com', 'System Admin', 'admin', 'password123'),
('2001', 'teacher@school.com', 'Mr. Smith', 'teacher', 'password123'),
('3001', 'student@school.com', 'John Doe', 'student', 'password123'),

INSERT INTO grades (student_id, subject, score, feedback) VALUES
('3001', 'Mathematics', 85, 'Excellent work!'),
('3001', 'Science', 92, 'Consistent performance.');
