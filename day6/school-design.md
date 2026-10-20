# School Database Design

## Tables

- **students**: one row per student. Columns: `student_id` (primary key), `name` and `email`. The email is `NOT NULL` and `UNIQUE`, so two students cannot share one.
- **courses**: one row per course. Columns: `course_id` (primary key), `title` and `credits`.
- **enrolments**: one row per student-on-a-course. Columns: `enrolment_id` (primary key), `student_id` and `course_id` (both foreign keys), and `grade`, which stays `NULL` until a grade is given. A `UNIQUE (student_id, course_id)` rule stops the same student enrolling on the same course twice.

## Relationships

- **students to enrolments: one-to-many.** One student can have many enrolments, but each enrolment belongs to exactly one student.
- **courses to enrolments: one-to-many.** One course can have many enrolments, but each enrolment belongs to exactly one course.
- **students to courses: many-to-many.** A student takes many courses and a course has many students.

A join table is needed because a relational table cannot hold a list in one column. Putting `course_id` on `students` would allow only one course per student, and the reverse would allow only one student per course. The `enrolments` table splits the many-to-many link into two one-to-many links. It is also the natural home for the grade, because a grade belongs to the pairing of a student and a course, not to either one alone.

## Index

I would add an index on `enrolments(course_id)`:

```sql
CREATE INDEX idx_enrolments_course_id ON enrolments (course_id);
```

The `UNIQUE (student_id, course_id)` rule already creates an index that speeds up searches by student. Searches by course alone, such as "all students on one course" or "students per course", cannot use it efficiently, so they would scan the whole table as it grows. This index makes those lookups and joins fast.

## SQL or NoSQL?

I would choose SQL (a relational database). The data is highly structured and clearly related: students, courses and enrolments always have the same fields and link to each other. Rules such as unique emails, foreign keys and no duplicate enrolments are enforced by the database itself, which keeps the data correct. The queries are also relational: joins, counts per course and finding students with no enrolments are easy in SQL, and awkward in a document store where related data is spread across documents. NoSQL would make more sense if the data had no fixed shape, or had to scale across many servers at huge volume, and neither applies to a school.

