-- day6/school.sql
-- Works in SQLite (e.g. sqliteonline.com)

PRAGMA foreign_keys = ON;

-- ========== TABLES ==========

CREATE TABLE students (
    student_id INTEGER PRIMARY KEY,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE
);

CREATE TABLE courses (
    course_id INTEGER PRIMARY KEY,
    title     TEXT NOT NULL,
    credits   INTEGER NOT NULL
);

CREATE TABLE enrolments (
    enrolment_id INTEGER PRIMARY KEY,
    student_id   INTEGER NOT NULL,
    course_id    INTEGER NOT NULL,
    grade        TEXT,  -- NULL until a grade is given
    FOREIGN KEY (student_id) REFERENCES students (student_id),
    FOREIGN KEY (course_id)  REFERENCES courses (course_id),
    UNIQUE (student_id, course_id)  -- same student cannot join the same course twice
);

-- ========== SAMPLE DATA ==========

INSERT INTO students (student_id, name, email) VALUES
    (1, 'Alice Johnson', 'alice@example.com'),
    (2, 'Bob Smith',     'bob@example.com'),
    (3, 'Chloe Davis',   'chloe@example.com'),
    (4, 'Dan Evans',     'dan@example.com');

INSERT INTO courses (course_id, title, credits) VALUES
    (1, 'Databases',       10),
    (2, 'Web Development', 15),
    (3, 'Algorithms',      10);

INSERT INTO enrolments (enrolment_id, student_id, course_id, grade) VALUES
    (1, 1, 1, 'A'),
    (2, 1, 2, 'B'),
    (3, 2, 1, 'C'),
    (4, 3, 2, NULL),
    (5, 3, 3, 'B'),
    (6, 2, 3, 'A');
-- Dan Evans (student 4) has no enrolments on purpose.

-- ========== QUERIES ==========

-- 1. All courses for one student (by name)
SELECT c.title, e.grade
FROM students s
JOIN enrolments e ON e.student_id = s.student_id
JOIN courses c    ON c.course_id  = e.course_id
WHERE s.name = 'Alice Johnson';

-- 2. All students on one course
SELECT s.name, s.email
FROM courses c
JOIN enrolments e ON e.course_id  = c.course_id
JOIN students s   ON s.student_id = e.student_id
WHERE c.title = 'Databases';

-- 3. Number of students per course
SELECT c.title, COUNT(e.enrolment_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON e.course_id = c.course_id
GROUP BY c.course_id, c.title;

-- 4. Students who have no enrolments
SELECT s.name, s.email
FROM students s
LEFT JOIN enrolments e ON e.student_id = s.student_id
WHERE e.enrolment_id IS NULL;

-- 5. Update one enrolment's grade (Chloe's Web Development grade)
UPDATE enrolments
SET grade = 'A'
WHERE student_id = 3 AND course_id = 2;

-- Check the update worked
SELECT s.name, c.title, e.grade
FROM enrolments e
JOIN students s ON s.student_id = e.student_id
JOIN courses c  ON c.course_id  = e.course_id
WHERE s.student_id = 3;
