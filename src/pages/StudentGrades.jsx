import React, { useMemo, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useStatusToast } from '../hooks/useNotifications';
import { LoadingSpinner, StatusMessage } from '../components/ui';
import { exportStructuredPdf } from '../utils/pdfExport';
import './StudentGrades.css';

const getLetterGrade = (score = 0) => {
  if (score >= 94) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C';
  return 'F';
};

const getAverage = (items) => {
  if (items.length === 0) return 0;

  return items.reduce((total, grade) => total + Number(grade.score || 0), 0) / items.length;
};

const StudentGrades = () => {
  const { user, grades, users, teacherAssignments } = useAuth();
  const reportRef = useRef(null);
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  useStatusToast(statusMessage, 'success', 'Report ready');
  useStatusToast(errorMessage, 'error', 'Download issue');

  const studentGrades = useMemo(() => grades.filter((grade) => grade.studentId === user.id), [grades, user.id]);
  const studentAssignments = useMemo(() => teacherAssignments.filter((assignment) => assignment.studentId === user.id), [teacherAssignments, user.id]);
  const assignedRows = useMemo(() => {
    const gradedSubjectKeys = new Set(studentGrades.map((grade) => `${grade.subject}|${grade.schoolYear || ''}|${grade.semester || ''}`));

    return studentAssignments
      .filter((assignment) => !gradedSubjectKeys.has(`${assignment.subject}|${assignment.schoolYear || ''}|${assignment.semester || ''}`))
      .map((assignment) => ({
        id: `assignment-${assignment.id || `${assignment.teacherId}-${assignment.subject}`}`,
        subject: assignment.subject,
        score: null,
        feedback: 'Not graded yet',
        teacherName: users.find((currentUser) => currentUser.id === assignment.teacherId)?.name || assignment.teacherId,
        schoolYear: assignment.schoolYear || '2025-2026',
        semester: assignment.semester || '1st Semester',
        term: 'Pending',
        isAssignedOnly: true,
      }));
  }, [studentAssignments, studentGrades, users]);
  const subjectRows = [...studentGrades, ...assignedRows];
  const schoolYears = [...new Set(subjectRows.map((row) => row.schoolYear || '2025-2026'))];
  const semesters = [...new Set(subjectRows.map((row) => row.semester || '1st Semester'))];
  const displayGrades = studentGrades.filter((grade) => {
    const gradeSchoolYear = grade.schoolYear || '2025-2026';
    const gradeSemester = grade.semester || '1st Semester';

    return (selectedSchoolYear === 'All' || gradeSchoolYear === selectedSchoolYear)
      && (selectedSemester === 'All' || gradeSemester === selectedSemester);
  });
  const displayAssignedRows = assignedRows.filter((row) => {
    return (selectedSchoolYear === 'All' || row.schoolYear === selectedSchoolYear)
      && (selectedSemester === 'All' || row.semester === selectedSemester);
  });
  const displayRows = [...displayGrades, ...displayAssignedRows];
  const averageScore = getAverage(displayGrades);
  const cumulativeGpa = displayGrades.length ? (averageScore / 25).toFixed(1) : '0.0';
  const academicStatus = displayGrades.length ? (averageScore >= 75 ? 'Passed' : 'At Risk') : 'No Grades';
  const activeSubjects = new Set(displayRows.map((row) => row.subject)).size;
  const selectedGrade = displayRows[0];
  const gradeHistory = Object.values(studentGrades.reduce((groups, grade) => {
    const key = `${grade.schoolYear || '2025-2026'}|${grade.semester || '1st Semester'}|${grade.term || 'All Terms'}`;
    const currentGroup = groups[key] || {
      key,
      schoolYear: grade.schoolYear || '2025-2026',
      semester: grade.semester || '1st Semester',
      term: grade.term || 'All Terms',
      grades: [],
    };

    currentGroup.grades.push(grade);
    groups[key] = currentGroup;
    return groups;
  }, {})).map((group) => ({
    ...group,
    average: getAverage(group.grades),
  }));

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = async () => {
    try {
      setIsDownloading(true);
      setStatusMessage('');
      setErrorMessage('');
      exportStructuredPdf({
        filename: `Grade_Report_${user.id}.pdf`,
        title: `Grade Report - ${user.name}`,
        subtitle: 'Student academic summary generated from recorded grade data.',
        meta: [
          { label: 'Student ID', value: user.id },
          { label: 'School Year', value: selectedSchoolYear },
          { label: 'Semester', value: selectedSemester },
        ],
        summary: [
          { label: 'Cumulative GPA', value: cumulativeGpa },
          { label: 'Active Subjects', value: activeSubjects },
          { label: 'Academic Status', value: academicStatus },
        ],
        sections: [
          {
            title: 'Subject Grades',
            columns: [
              { header: 'Subject', accessor: 'subject', width: 1.3 },
              { header: 'Score', accessor: (grade) => (grade.isAssignedOnly ? 'Not graded yet' : `${Number(grade.score).toFixed(1)}/100`), width: 0.8 },
              { header: 'Grade', accessor: (grade) => (grade.isAssignedOnly ? 'Pending' : getLetterGrade(Number(grade.score))), width: 0.7 },
              { header: 'Feedback', accessor: (grade) => grade.feedback || 'No feedback yet', width: 1.6 },
            ],
            rows: displayRows,
            emptyMessage: 'No subjects match the selected term.',
          },
          {
            title: 'Grade History',
            columns: [
              { header: 'School Year', accessor: 'schoolYear' },
              { header: 'Semester', accessor: 'semester' },
              { header: 'Term', accessor: 'term' },
              { header: 'GPA', accessor: (item) => (item.average / 25).toFixed(1) },
            ],
            rows: gradeHistory,
            emptyMessage: 'No grade history yet.',
          },
        ],
      });
      setStatusMessage('Your grade report downloaded successfully.');
    } catch {
      setErrorMessage('We could not download your report. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grades-page">
      {statusMessage && <StatusMessage variant="success" className="student-report-status">{statusMessage}</StatusMessage>}
      {errorMessage && <StatusMessage variant="error" className="student-report-status">{errorMessage}</StatusMessage>}

      <div ref={reportRef}>
        <div className="grades-toolbar">
          <h1>My Grades</h1>

          <div className="grades-filters">
            <label>
              <span>School Year</span>
              <select value={selectedSchoolYear} onChange={(event) => setSelectedSchoolYear(event.target.value)}>
                <option value="All">All years</option>
                {schoolYears.map((schoolYear) => (
                  <option value={schoolYear} key={schoolYear}>{schoolYear}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Semester</span>
              <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)}>
                <option value="All">All semesters</option>
                {semesters.map((semester) => (
                  <option value={semester} key={semester}>{semester}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="grades-content-grid">
          <main className="grades-main">
            <div className="grades-stats">
              <section className="grade-stat-card">
                <h2>Cumulative GPA</h2>
                <p>{cumulativeGpa}</p>
              </section>
              <section className="grade-stat-card">
                <h2>Active Subjects</h2>
                <p>{activeSubjects}</p>
              </section>
              <section className="grade-stat-card status-card">
                <h2>Academic Status</h2>
                <p>{academicStatus}</p>
              </section>
            </div>

            <section className="grades-table-card">
              <table className="student-grades-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Grade</th>
                    <th>Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((grade) => (
                    <tr key={grade.id}>
                      <td>{grade.subject}</td>
                      <td>{grade.isAssignedOnly ? 'Not graded yet' : Number(grade.score).toFixed(1)}</td>
                      <td>
                        <span>{grade.isAssignedOnly ? 'Pending' : getLetterGrade(Number(grade.score))}</span>
                      </td>
                      <td>{grade.feedback || 'No feedback yet'}</td>
                    </tr>
                  ))}
                  {displayRows.length === 0 && (
                    <tr>
                      <td colSpan="4">No subjects match the selected term.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="academic-journey">
              <h2>Grade History</h2>
              <div className="journey-list">
                {gradeHistory.map((item) => (
                  <article key={item.key}>
                    <small>{item.schoolYear}</small>
                    <strong>{item.semester} - {item.term}</strong>
                    <b>{(item.average / 25).toFixed(1)} GPA</b>
                  </article>
                ))}
                {gradeHistory.length === 0 && (
                  <article>
                    <small>No records</small>
                    <strong>No grade history yet</strong>
                    <b>0.0 GPA</b>
                  </article>
                )}
              </div>
            </section>
          </main>

          <aside className="grades-side">
            <section className="subject-detail-card">
              <h2>Subject: {selectedGrade?.subject || 'No subject selected'}</h2>
              <div className="activity-table">
                <div>
                  <span>Term</span>
                  <span>Score</span>
                </div>
                <div>
                  <span>{selectedGrade?.term || 'N/A'}</span>
                  <strong>{selectedGrade && !selectedGrade.isAssignedOnly ? `${Number(selectedGrade.score).toFixed(1)}/100` : '--'}</strong>
                </div>
                <div>
                  <span>Semester</span>
                  <strong>{selectedGrade?.semester || 'N/A'}</strong>
                </div>
                <div>
                  <span>School Year</span>
                  <strong>{selectedGrade?.schoolYear || 'N/A'}</strong>
                </div>
              </div>

              <div className="teacher-note">
                <h3>Teacher Feedback</h3>
                <p>{selectedGrade?.feedback || 'No feedback yet.'}</p>
              </div>
            </section>
          </aside>
        </div>
      </div>

      <div className="grades-actions grades-report-actions">
        <button className="download-report-btn" type="button" onClick={handleDownloadReport} disabled={isDownloading}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M9 15h6M12 12v6" />
          </svg>
          <span className="button-content">
            {isDownloading && <LoadingSpinner label="Downloading grade report" size="small" />}
            {isDownloading ? 'Downloading...' : 'Download Report PDF'}
          </span>
        </button>
        <button className="print-report-btn" type="button" onClick={handlePrint}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 14h12v8H6z" />
          </svg>
          Print Report
        </button>
      </div>
    </div>
  );
};

export default StudentGrades;
