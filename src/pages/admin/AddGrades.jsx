import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useStatusToast } from '../../hooks/useNotifications';
import { CenteredStatusCard, LoadingSpinner, StatusMessage } from '../../components/ui';
import UserAvatar from '../../components/UserAvatar';
import { getCourses } from '../../services/adminService';
import './AddGrades.css';

const activities = [
  { id: 'quiz1', label: 'Quiz 1', max: 20 },
  { id: 'quiz2', label: 'Quiz 2', max: 20 },
  { id: 'assignment', label: 'Assignment', max: 20 },
  { id: 'midterm', label: 'Midterm Exam', max: 50 },
  { id: 'final', label: 'Final Exam', max: 100 },
];

const fallbackRows = [
  { id: '2024-0015', name: 'Alessa Arong', quiz: 90, assignment: 95, midterm: 95, final: 96, total: '94.0', grade: 'A' },
  { id: '2024-0016', name: 'Annie Mamitag', quiz: 88, assignment: 92, midterm: 90, final: 94, total: '91.0', grade: 'A-' },
  { id: '2024-0017', name: 'Juffiea Visitacion', quiz: 70, assignment: 75, midterm: 72, final: 72, total: '72.2', grade: 'C' },
];

const getLetterGrade = (score) => {
  if (score >= 93) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 83) return 'B';
  if (score >= 80) return 'B-';
  if (score >= 75) return 'C';
  return 'F';
};

const getErrorText = (error, fallback) => {
  return error instanceof Error && error.message ? error.message : fallback;
};

const valuesMatch = (left, right) => {
  return String(left || '').trim().toLowerCase() === String(right || '').trim().toLowerCase();
};

const assignmentMatchesSubject = (assignment, subjectName) => {
  if (!subjectName) {
    return true;
  }

  return [assignment.subject, assignment.course, assignment.section].some((value) => valuesMatch(value, subjectName));
};

const AddGrades = () => {
  const { user, users, grades, addGrade, classAnalytics, teacherAssignments } = useAuth();
  const students = users.filter((user) => user.role === 'student');
  const fileInputRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [subject, setSubject] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [semester, setSemester] = useState('1st Semester');
  const [term, setTerm] = useState('Prelim');
  const [scores, setScores] = useState({
    quiz1: '18',
    quiz2: '',
    assignment: '20',
    midterm: '',
    final: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  useStatusToast(successMessage, 'success', 'Grades updated');
  useStatusToast(errorMessage, 'error', 'Grades issue');

  useEffect(() => {
    getCourses()
      .then(setCourses)
      .catch(() => {
        setCourses([]);
      });
  }, []);

  const courseOptions = useMemo(() => {
    const teacherSubjects = new Set(
      teacherAssignments
        .filter((assignment) => !user || user.role !== 'teacher' || assignment.teacherId === user.id)
        .map((assignment) => assignment.subject)
        .filter(Boolean)
    );
    const visibleCourses = user?.role === 'teacher'
      ? courses.filter((course) => course.teacherId === user.id || teacherSubjects.has(course.name))
      : courses;
    const courseMap = new Map();

    visibleCourses.forEach((course) => {
      if (course.name) {
        courseMap.set(course.name, course);
      }
    });

    teacherSubjects.forEach((subjectName) => {
      if (!courseMap.has(subjectName)) {
        courseMap.set(subjectName, { id: subjectName, name: subjectName, code: '' });
      }
    });

    return Array.from(courseMap.values()).sort((firstCourse, secondCourse) => firstCourse.name.localeCompare(secondCourse.name));
  }, [courses, teacherAssignments, user]);

  const availableStudents = useMemo(() => {
    if (user?.role !== 'teacher') {
      return students;
    }

    return students.filter((student) => (
      teacherAssignments.some((assignment) => (
        assignment.teacherId === user.id
        && valuesMatch(assignment.studentId, student.id)
        && assignmentMatchesSubject(assignment, subject)
      ))
    ));
  }, [students, subject, teacherAssignments, user]);

  useEffect(() => {
    if (courseOptions.length === 0) {
      setSubject('');
      setSelectedSubjectFilter('');
      return;
    }

    if (!courseOptions.some((course) => course.name === subject)) {
      setSubject(courseOptions[0].name);
    }

    if (selectedSubjectFilter && !courseOptions.some((course) => course.name === selectedSubjectFilter)) {
      setSelectedSubjectFilter('');
    }
  }, [courseOptions, selectedSubjectFilter, subject]);

  useEffect(() => {
    if (!availableStudents.length) {
      setSelectedStudentId('');
      return;
    }

    if (!availableStudents.some((student) => valuesMatch(student.id, selectedStudentId))) {
      setSelectedStudentId(availableStudents[0].id);
    }
  }, [availableStudents, selectedStudentId]);

  const classOptions = useMemo(() => {
    const labels = courseOptions
      .map((course) => course.code || course.section || course.name)
      .filter(Boolean);

    return Array.from(new Set(labels));
  }, [courseOptions]);

  useEffect(() => {
    if (selectedClassFilter && !classOptions.includes(selectedClassFilter)) {
      setSelectedClassFilter('');
    }
  }, [classOptions, selectedClassFilter]);

  const selectedStudent = useMemo(() => {
    return availableStudents.find((student) => valuesMatch(student.id, selectedStudentId)) || availableStudents[0] || fallbackRows[0];
  }, [availableStudents, selectedStudentId]);

  const selectedCourse = useMemo(() => {
    return courseOptions.find((course) => course.name === subject) || courseOptions[0] || null;
  }, [courseOptions, subject]);

  const rows = useMemo(() => {
    return students.length
      ? students.map((student) => {
        const studentGrades = grades.filter((grade) => grade.studentId === student.id);
        const latestGrade = studentGrades[0];
        const averageScore = studentGrades.length
          ? studentGrades.reduce((total, grade) => total + Number(grade.score || 0), 0) / studentGrades.length
          : 0;

        return {
          id: student.id,
          name: student.name,
          profilePicture: student.profilePicture,
          quiz: latestGrade?.term || '-',
          assignment: latestGrade?.subject || '-',
          midterm: latestGrade?.semester || '-',
          final: latestGrade?.schoolYear || '-',
          total: averageScore ? averageScore.toFixed(1) : '0.0',
          grade: averageScore ? getLetterGrade(averageScore) : 'N/A',
        };
      })
      : [];
  }, [grades, students]);

  const displayRows = useMemo(() => {
    return rows.filter((row) => {
      const studentGrades = grades.filter((grade) => String(grade.studentId) === String(row.id));
      const studentAssignments = teacherAssignments.filter((assignment) => String(assignment.studentId) === String(row.id));
      const matchesSubject = !selectedSubjectFilter
        || studentGrades.some((grade) => grade.subject === selectedSubjectFilter)
        || studentAssignments.some((assignment) => assignment.subject === selectedSubjectFilter);
      const matchesClass = !selectedClassFilter
        || studentAssignments.some((assignment) => [assignment.section, assignment.course].includes(selectedClassFilter))
        || students.find((student) => String(student.id) === String(row.id))?.course === selectedClassFilter;

      return matchesSubject && matchesClass;
    });
  }, [grades, rows, selectedClassFilter, selectedSubjectFilter, students, teacherAssignments]);

  const hasCompleteScores = activities.every((activity) => scores[activity.id] !== '');
  const finalScore = hasCompleteScores
    ? (
        activities.reduce((total, activity) => total + Number(scores[activity.id] || 0), 0)
        / activities.reduce((total, activity) => total + activity.max, 0)
        * 100
      ).toFixed(1)
    : '---';
  const letterGrade = hasCompleteScores ? getLetterGrade(Number(finalScore)) : '---';
  const status = hasCompleteScores ? 'Complete' : 'Incomplete';

  const handleScoreChange = (activity, value) => {
    if (value !== '' && Number.isNaN(Number(value))) {
      return;
    }

    setErrorMessage('');
    const numericValue = value === '' ? '' : Math.min(Number(value), activity.max);
    setScores((currentScores) => ({
      ...currentScores,
      [activity.id]: numericValue === '' ? '' : String(Math.max(numericValue, 0)),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasCompleteScores) {
      setErrorMessage('Complete every score field before saving grades.');
      return;
    }

    if (!selectedStudentId) {
      setErrorMessage(subject ? 'Assign at least one student to this subject before saving grades.' : 'Assign students to this teacher before saving grades.');
      return;
    }

    if (!subject) {
      setErrorMessage('Create or assign a course before saving grades.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');
      await addGrade({
        studentId: selectedStudentId,
        subject,
        score: Number(finalScore),
        feedback: `Quiz 1: ${scores.quiz1}, Quiz 2: ${scores.quiz2}, Assignment: ${scores.assignment}, Midterm: ${scores.midterm}, Final: ${scores.final}`,
        schoolYear,
        semester,
        term,
      });
      setIsModalOpen(false);
      setSuccessMessage(`Grades for ${selectedStudent.name} were saved successfully.`);
    } catch (error) {
      setErrorMessage(getErrorText(error, 'We could not save the grade. Check the student and scores, then try again.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCsv = () => {
    const header = ['Student ID', 'Student Name', 'Latest Term', 'Latest Subject', 'Semester', 'School Year', 'Average Score', 'Grade'];
    const body = displayRows.map((row) => [row.id, row.name, row.quiz, row.assignment, row.midterm, row.final, row.total, row.grade]);
    const csvContent = [header, ...body]
      .map((values) => values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'assigned-student-grades.csv';
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Student grades exported to CSV.');
  };

  const handleExportExcel = () => {
    const tableRows = displayRows.map((row) => `
      <tr>
        <td>${row.id}</td>
        <td>${row.name}</td>
        <td>${row.quiz}</td>
        <td>${row.assignment}</td>
        <td>${row.midterm}</td>
        <td>${row.final}</td>
        <td>${row.total}</td>
        <td>${row.grade}</td>
      </tr>
    `).join('');
    const workbook = `
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Latest Term</th>
            <th>Latest Subject</th>
            <th>Semester</th>
            <th>School Year</th>
            <th>Average Score</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'assigned-student-grades.xls';
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Student grades exported to Excel.');
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please upload a CSV file exported from Excel with columns: studentId, subject, score, feedback.');
      event.target.value = '';
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const text = await file.text();
      const rowsToUpload = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(1)
        .map((line) => {
          const [studentId, uploadedSubject, score, feedback = '', uploadedSchoolYear = schoolYear, uploadedSemester = semester, uploadedTerm = term] = line.split(',').map((value) => value.replace(/^"|"$/g, '').trim());
          return {
            studentId,
            subject: uploadedSubject,
            score: Number(score),
            feedback,
            schoolYear: uploadedSchoolYear,
            semester: uploadedSemester,
            term: uploadedTerm,
          };
        })
        .filter((row) => row.studentId && row.subject && Number.isFinite(row.score));

      if (rowsToUpload.length === 0) {
        setErrorMessage('No valid grade rows were found. Use columns: studentId, subject, score, feedback.');
        return;
      }

      await Promise.all(rowsToUpload.map((row) => addGrade(row)));
      setSuccessMessage(`${rowsToUpload.length} grade row${rowsToUpload.length === 1 ? '' : 's'} uploaded successfully.`);
    } catch (error) {
      setErrorMessage(getErrorText(error, 'We could not upload the grades. Check the CSV format and try again.'));
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="grades-management-page">
      <CenteredStatusCard
        variant={errorMessage ? 'error' : 'success'}
        title={errorMessage ? 'Action Needed' : 'Success'}
        message={errorMessage || successMessage}
        onDismiss={() => {
          if (errorMessage) {
            setErrorMessage('');
          } else {
            setSuccessMessage('');
          }
        }}
      />

      <div className="grades-management-header">
        <h1>Grades Management</h1>
        <div className="grades-management-actions">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <span className="button-content">
              {isUploading && <LoadingSpinner label="Uploading grades" size="small" />}
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="grades-file-input"
            onChange={handleBulkUpload}
          />
          <button type="button" onClick={handleExportCsv}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Export CSV
          </button>
          <button type="button" onClick={handleExportExcel}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Export Excel
          </button>
          <button type="button" className="grades-add-btn" onClick={() => setIsModalOpen(true)}>
            + Add Grades
          </button>
        </div>
      </div>

      {successMessage && <StatusMessage variant="success" className="grades-status-message">{successMessage}</StatusMessage>}
      {errorMessage && <StatusMessage variant="error" className="grades-status-message">{errorMessage}</StatusMessage>}

      <section className="grades-filter-bar" aria-label="Grade filters">
        <label>
          <span>Subject</span>
          <select value={selectedSubjectFilter} onChange={(event) => setSelectedSubjectFilter(event.target.value)}>
            <option value="">All subjects</option>
            {courseOptions.map((course) => (
              <option key={course.id || course.name} value={course.name}>{course.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Class</span>
          <select value={selectedClassFilter} onChange={(event) => setSelectedClassFilter(event.target.value)}>
            <option value="">All classes</option>
            {classOptions.map((className) => (
              <option key={className} value={className}>{className}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Semester</span>
          <select defaultValue="1st Semester">
            <option>1st Semester</option>
            <option>2nd Semester</option>
          </select>
        </label>
        <button type="button" onClick={() => {
          setSelectedSubjectFilter('');
          setSelectedClassFilter('');
        }}>Clear Filters</button>
      </section>

      <section className="grades-table-card">
        <table className="grades-management-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Latest Term</th>
              <th>Latest Subject</th>
              <th>Semester</th>
              <th>School Year</th>
              <th>Average Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => (
              <tr key={row.id}>
                <td>
                  <UserAvatar user={row} className="grades-student-avatar" fallback="S" />
                  <span className="grades-student-info">
                    <strong>{row.name}</strong>
                    <small>ID: {row.id}</small>
                  </span>
                </td>
                <td>{row.quiz}</td>
                <td>{row.assignment}</td>
                <td>{row.midterm}</td>
                <td>{row.final}</td>
                <td className="grades-total">{row.total}</td>
                <td>
                  <span className={`grades-letter ${row.grade === 'C' ? 'low' : ''}`}>{row.grade}</span>
                </td>
              </tr>
            ))}
            {displayRows.length === 0 && (
              <tr>
                <td colSpan="7">{students.length === 0 ? 'No assigned students yet. Ask an admin to assign students before adding grades.' : 'No students match the selected filters.'}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="grades-table-footer">
          <span>Showing {displayRows.length} assigned student{displayRows.length === 1 ? '' : 's'}</span>
          <div className="grades-pagination" aria-label="Pagination">
            <button type="button" className="active">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button" aria-label="Next page">{'>'}</button>
          </div>
        </div>
      </section>

      <div className="grades-summary-grid">
        <section className="grades-summary-card dark">
          <p>Class Average</p>
          <strong>{classAnalytics?.classAverage || 0}%</strong>
          <small>Based on visible assigned grades</small>
        </section>
        <section className="grades-summary-card purple">
          <p>Top Performers</p>
          <strong>{classAnalytics?.topPerformers?.length || 0}</strong>
          <small>Students ranked by average score</small>
        </section>
        <section className="grades-summary-card muted">
          <p>Grade Records</p>
          <strong>{grades.length}</strong>
          <small>Visible for this role</small>
        </section>
      </div>

      {isModalOpen && (
        <div className="add-grades-overlay" role="presentation">
          <form className="add-grades-modal" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="add-grades-title" aria-busy={isSaving}>
            <div className="add-grades-modal-header">
              <h2 id="add-grades-title">Add Grades - {subject || 'Select Course'}{selectedCourse?.code ? ` (${selectedCourse.code})` : ''}</h2>
              <button type="button" aria-label="Close add grades modal" onClick={() => setIsModalOpen(false)}>
                x
              </button>
            </div>

            <label className="add-grades-field">
              <span>Select Student</span>
              <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
                {availableStudents.length === 0 && <option value="">No assigned students</option>}
                {availableStudents.map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </label>

            <label className="add-grades-field">
              <span>Subject</span>
              <select value={subject} onChange={(event) => setSubject(event.target.value)} required>
                {courseOptions.length === 0 && <option value="">No courses available</option>}
                {courseOptions.map((course) => (
                  <option key={course.id || course.name} value={course.name}>{course.name}</option>
                ))}
              </select>
            </label>

            <div className="form-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <label className="add-grades-field">
                <span>School Year</span>
                <input value={schoolYear} onChange={(event) => setSchoolYear(event.target.value)} required />
              </label>
              <label className="add-grades-field">
                <span>Semester</span>
                <select value={semester} onChange={(event) => setSemester(event.target.value)}>
                  <option>1st Semester</option>
                  <option>2nd Semester</option>
                  <option>Summer</option>
                </select>
              </label>
              <label className="add-grades-field">
                <span>Term</span>
                <select value={term} onChange={(event) => setTerm(event.target.value)}>
                  <option>Prelim</option>
                  <option>Midterm</option>
                  <option>Final</option>
                </select>
              </label>
            </div>

            <div className="score-entry">
              <p>Scores Entry</p>
              <div className="score-entry-table">
                <div className="score-entry-head">
                  <span>Activity</span>
                  <span>Score</span>
                  <span>Max Score</span>
                </div>
                {activities.map((activity) => (
                  <label className="score-entry-row" key={activity.id}>
                    <span>{activity.label}</span>
                    <input
                      type="number"
                      min="0"
                      max={activity.max}
                      value={scores[activity.id]}
                      placeholder="-"
                      aria-label={`${activity.label} score for ${selectedStudent.name}`}
                      onChange={(event) => handleScoreChange(activity, event.target.value)}
                    />
                    <span>{activity.max}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grade-result">
              <p>Result (Auto)</p>
              <div className="grade-result-panel">
                <span>
                  <small>Final Score</small>
                  <strong>{finalScore}</strong>
                </span>
                <span>
                  <small>Grade</small>
                  <strong>{letterGrade}</strong>
                </span>
                <span>
                  <small>Status</small>
                  <strong>- {status}</strong>
                </span>
              </div>
            </div>

            {!hasCompleteScores && (
              <StatusMessage variant="info" className="add-grades-validation-message">
                Enter all scores to enable Save Grades.
              </StatusMessage>
            )}

            <div className="add-grades-modal-actions">
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={!hasCompleteScores || !subject || !selectedStudentId || isSaving}>
                <span className="button-content">
                  {isSaving && <LoadingSpinner label="Saving grades" size="small" />}
                  {isSaving ? 'Saving...' : 'Save Grades'}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddGrades;
