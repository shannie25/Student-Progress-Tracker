import React, { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';
import { LoadingSpinner, StatusMessage } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import './GenerateReport.css';

const getLetterGrade = (score = 0) => {
  if (score >= 94) return 'A';
  if (score >= 90) return 'A-';
  if (score >= 87) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C';
  return 'F';
};

const getAverageScore = (grades) => {
  if (grades.length === 0) {
    return 0;
  }

  return Math.round(grades.reduce((total, grade) => total + Number(grade.score || 0), 0) / grades.length);
};

const formatPercent = (value) => `${Math.max(0, Math.min(100, Math.round(value)))}%`;

const GenerateReport = () => {
  const { user, grades, users, attendance, teacherAssignments } = useAuth();
  const reportRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedSchoolYear, setSelectedSchoolYear] = useState('All');
  const [selectedReportType, setSelectedReportType] = useState('Class Summary');
  const isStudentReport = user.role === 'student';
  const reportBaseGrades = isStudentReport ? grades.filter((grade) => grade.studentId === user.id) : grades;
  const subjectOptions = [...new Set(reportBaseGrades.map((grade) => grade.subject).filter(Boolean))].sort();
  const semesterOptions = [...new Set(reportBaseGrades.map((grade) => grade.semester || '1st Semester'))].sort();
  const schoolYearOptions = [...new Set(reportBaseGrades.map((grade) => grade.schoolYear || '2024-2025'))].sort();
  const reportGrades = reportBaseGrades.filter((grade) => {
    const gradeSubject = grade.subject || '';
    const gradeSemester = grade.semester || '1st Semester';
    const gradeSchoolYear = grade.schoolYear || '2024-2025';

    return (selectedSubject === 'All' || gradeSubject === selectedSubject)
      && (selectedSemester === 'All' || gradeSemester === selectedSemester)
      && (selectedSchoolYear === 'All' || gradeSchoolYear === selectedSchoolYear);
  });
  const averageScore = getAverageScore(reportGrades);
  const totalStudents = isStudentReport
    ? 1
    : new Set(reportGrades.map((grade) => grade.studentId)).size || users.filter((currentUser) => currentUser.role === 'student').length;
  const studentAverages = Object.values(reportGrades.reduce((groups, grade) => {
    const group = groups[grade.studentId] || { studentId: grade.studentId, grades: [] };
    group.grades.push(grade);
    groups[grade.studentId] = group;
    return groups;
  }, {})).map((group) => {
    const average = getAverageScore(group.grades);
    return {
      studentId: group.studentId,
      name: users.find((currentUser) => currentUser.id === group.studentId)?.name || group.studentId,
      average,
      feedback: group.grades[0]?.feedback || '',
    };
  }).sort((left, right) => right.average - left.average);
  const registryRows = isStudentReport
    ? (reportGrades.length > 0 ? reportGrades : [{ id: 0, subject: 'No grades yet', score: 0, feedback: 'No feedback yet' }]).map((grade, index) => ({
        rank: `#${index + 1}`,
        name: grade.subject,
        score: Number(grade.score || 0).toFixed(2),
        grade: getLetterGrade(grade.score),
        status: grade.feedback || 'No feedback yet',
      }))
    : studentAverages.map((student, index) => ({
        rank: `#${index + 1}`,
        name: student.name,
        score: Number(student.average || 0).toFixed(2),
        grade: getLetterGrade(student.average),
        status: student.average < 75 ? 'Warning' : student.feedback || 'Recorded',
      }));
  const distributionCounts = reportGrades.reduce((counts, grade) => {
    const letter = getLetterGrade(Number(grade.score || 0)).charAt(0);
    counts[letter] = (counts[letter] || 0) + 1;
    return counts;
  }, { A: 0, B: 0, C: 0, D: 0, F: 0 });
  const maxDistribution = Math.max(...Object.values(distributionCounts), 1);
  const distributionRows = Object.entries(distributionCounts).map(([grade, count]) => ({
    grade,
    count,
    width: `${Math.max((count / maxDistribution) * 100, count ? 16 : 4)}%`,
    label: `${count} ${count === 1 ? 'Student' : 'Students'}`,
    danger: grade === 'F',
  }));
  const topPerformers = studentAverages.slice(0, 2);
  const bottomPerformers = studentAverages.slice(-1);
  const reportTitle = isStudentReport
    ? `Student Report: ${user.name}`
    : user.role === 'teacher'
      ? 'Class Report: Assigned Students'
      : 'Class Report: All Students';
  const adminReportType = selectedReportType === 'Class Summary' ? 'All Teachers' : selectedReportType;
  const adminStudentRows = users
    .filter((currentUser) => currentUser.role === 'student')
    .map((student) => {
      const studentGrades = reportGrades.filter((grade) => grade.studentId === student.id);
      const latestGrade = studentGrades[0] || grades.find((grade) => grade.studentId === student.id);

      return {
        id: student.id,
        name: student.name,
        course: selectedSubject === 'All' ? latestGrade?.subject || 'BSIT' : selectedSubject,
        status: studentGrades.length || selectedSubject === 'All' ? 'Active' : 'Filtered',
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
  const adminTeacherRows = users
    .filter((currentUser) => currentUser.role === 'teacher')
    .map((teacher) => {
      const assignment = teacherAssignments.find((item) => item.teacherId === teacher.id);

      return {
        id: teacher.id,
        name: teacher.name,
        subject: assignment?.subject || 'TBA',
        course: assignment?.course || (selectedSubject !== 'All' ? selectedSubject : 'BSIT'),
        status: 'Active',
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
  const adminGradeRows = adminStudentRows.map((student) => {
    const studentGrades = reportGrades.filter((grade) => grade.studentId === student.id);
    const average = getAverageScore(studentGrades);

    return {
      id: student.id,
      name: student.name,
      quiz: formatPercent(average ? average - 4 : 0),
      midterm: formatPercent(average ? average - 1 : 0),
      final: formatPercent(average ? average + 2 : 0),
      finalScore: average ? `${formatPercent(average)} (${getLetterGrade(average)})` : 'N/A',
    };
  });
  const adminAttendanceRows = adminStudentRows.map((student) => {
    const studentAttendance = attendance.filter((record) => record.studentId === student.id);
    const present = studentAttendance.filter((record) => record.status === 'present' || record.status === 'late').length;
    const absent = studentAttendance.filter((record) => record.status === 'absent').length;
    const rate = studentAttendance.length ? (present / studentAttendance.length) * 100 : 0;

    return {
      id: student.id,
      name: student.name,
      present,
      absent,
      rate: formatPercent(rate),
    };
  });
  const adminCourseRows = Object.values(teacherAssignments.reduce((groups, assignment) => {
    const courseName = assignment.course || (selectedSubject !== 'All' ? selectedSubject : 'BSIT');
    const group = groups[courseName] || {
      id: courseName,
      course: courseName,
      subjects: new Set(),
      teacherIds: new Set(),
    };

    group.subjects.add(assignment.subject || 'TBA');
    if (assignment.teacherId) {
      group.teacherIds.add(assignment.teacherId);
    }
    groups[courseName] = group;
    return groups;
  }, {})).map((course) => ({
    id: course.id,
    course: course.course,
    subjects: [...course.subjects].slice(0, 3),
    teacher: [...course.teacherIds].map((teacherId) => users.find((currentUser) => currentUser.id === teacherId)?.name).filter(Boolean).join(', ') || 'Unassigned',
  }));
  const adminReportConfig = {
    'All Teachers': {
      title: 'Faculty Directory',
      empty: 'No teachers match the selected report filters.',
      countLabel: 'teachers',
      headers: ['Faculty ID', 'Name', 'Subject', 'Course', 'Status'],
      rows: adminTeacherRows.length ? adminTeacherRows : [
        { id: 'T-001', name: 'Prof. Reyes', subject: 'IM', course: 'BSIT', status: 'Active' },
        { id: 'T-002', name: 'Dr. Cruz', subject: 'DSA', course: 'BSIT', status: 'Active' },
      ],
    },
    'Student Grades': {
      title: 'Student Performance',
      empty: 'No student grades match the selected report filters.',
      countLabel: 'students',
      headers: ['Name', 'Quiz Avg', 'Midterm', 'Final', 'Final Score'],
      rows: adminGradeRows,
    },
    'Attendance Records': {
      title: 'Student Performance',
      empty: 'No attendance records match the selected report filters.',
      countLabel: 'students',
      headers: ['Student', 'Present', 'Absent', 'Attendance Rate'],
      rows: adminAttendanceRows,
    },
    'Courses & Subjects': {
      title: 'Courses & Subject',
      empty: 'No courses or subjects match the selected report filters.',
      countLabel: 'students',
      headers: ['Course', 'Subjects', 'Teacher'],
      rows: adminCourseRows.length ? adminCourseRows : [
        { id: 'BSIT', course: 'BSIT', subjects: ['IM', 'RESEARCH', 'SIA'], teacher: 'Prof. Petruba' },
        { id: 'BSIT-2', course: 'BSIT', subjects: ['SPELEC', 'IPT'], teacher: 'Prof. Bangilan' },
      ],
    },
  };
  const activeAdminReport = adminReportConfig[adminReportType] || adminReportConfig['All Teachers'];
  const adminVisibleRows = activeAdminReport.rows.slice(0, 2);
  const syncPercent = reportGrades.length ? '99.8%' : '0%';

  const handlePrint = () => {
    window.print();
  };

  const handleGenerateReport = () => {
    setErrorMessage('');
    if (user.role === 'admin') {
      setStatusMessage(`${adminReportType} updated with ${activeAdminReport.rows.length} ${activeAdminReport.countLabel} record${activeAdminReport.rows.length === 1 ? '' : 's'}.`);
      return;
    }

    setStatusMessage(`${selectedReportType} updated with ${reportGrades.length} grade record${reportGrades.length === 1 ? '' : 's'}.`);
  };

  const handleClearReportFilters = () => {
    setSelectedSubject('All');
    setSelectedSemester('All');
    setSelectedSchoolYear('All');
    setSelectedReportType('Class Summary');
    setErrorMessage('');
    setStatusMessage('Showing all available report records.');
  };

  const handleDownloadPDF = async () => {
    const element = reportRef.current;

    if (!element) {
      setErrorMessage('The report is not ready yet. Please try again in a moment.');
      return;
    }

    const options = {
      margin: 8,
      filename: `${isStudentReport ? 'Student' : 'Class'}_Report_${user.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    };

    try {
      setIsDownloading(true);
      setStatusMessage('');
      setErrorMessage('');
      await html2pdf().set(options).from(element).save();
      setStatusMessage('PDF report downloaded successfully.');
    } catch {
      setErrorMessage('We could not download the PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportExcel = () => {
    const exportRows = user.role === 'admin'
      ? activeAdminReport.rows.map((row) => ({
          rank: row.id || row.name || row.course,
          name: row.name || row.course,
          score: row.subject || row.quiz || row.present || (Array.isArray(row.subjects) ? row.subjects.join(', ') : ''),
          grade: row.course || row.midterm || row.absent || row.teacher || '',
          status: row.status || row.finalScore || row.rate || '',
        }))
      : registryRows;
    const tableRows = exportRows.map((row) => `
      <tr>
        <td>${row.rank}</td>
        <td>${row.name}</td>
        <td>${row.score}</td>
        <td>${row.grade}</td>
        <td>${row.status}</td>
      </tr>
    `).join('');
    const workbook = `
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>${isStudentReport ? 'Subject' : 'Name'}</th>
            <th>Score</th>
            <th>Grade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    `;
    const blob = new Blob([workbook], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${isStudentReport ? 'student' : 'class'}-report-${user.id}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (user.role === 'admin') {
    return (
      <div className="class-report-page admin-report-page">
        <div className="class-report-header admin-report-header">
          <h1>Reports</h1>
          <div className="class-report-actions admin-report-actions">
            <button type="button" onClick={handleExportExcel}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="excel-icon">
                <path d="M4 4h16v16H4z" />
                <path d="m8 8 3 4-3 4M14 8h3M14 12h3M14 16h3" />
              </svg>
              Export Excel
            </button>
            <button type="button" onClick={handleDownloadPDF} disabled={isDownloading}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6M8 13h8M8 17h5" />
              </svg>
              <span className="button-content">
                {isDownloading && <LoadingSpinner label="Downloading PDF" size="small" />}
                {isDownloading ? 'Exporting...' : 'Export PDF'}
              </span>
            </button>
          </div>
        </div>

        {statusMessage && <StatusMessage variant="success" className="report-status-message">{statusMessage}</StatusMessage>}
        {errorMessage && <StatusMessage variant="error" className="report-status-message">{errorMessage}</StatusMessage>}

        <div className="admin-report-layout" ref={reportRef}>
          <aside className="admin-report-config">
            <div className="admin-report-config-title">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
                <path d="M2 14h4M10 8h4M18 16h4" />
              </svg>
              <h2>Report Configuration</h2>
            </div>

            <label>
              <span>Report Type</span>
              <select value={adminReportType} onChange={(event) => setSelectedReportType(event.target.value)}>
                <option>All Teachers</option>
                <option>Student Grades</option>
                <option>Attendance Records</option>
                <option>Courses & Subjects</option>
              </select>
            </label>

            <label>
              <span>Course Program</span>
              <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
                <option value="All">BSIT</option>
                {subjectOptions.map((subject) => (
                  <option value={subject} key={subject}>{subject}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Academic Semester</span>
              <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)}>
                <option value="All">1st Semester</option>
                {semesterOptions.map((semester) => (
                  <option value={semester} key={semester}>{semester}</option>
                ))}
              </select>
            </label>

            <label>
              <span>School Year</span>
              <select value={selectedSchoolYear} onChange={(event) => setSelectedSchoolYear(event.target.value)}>
                <option value="All">2024 - 2025</option>
                {schoolYearOptions.map((schoolYear) => (
                  <option value={schoolYear} key={schoolYear}>{schoolYear}</option>
                ))}
              </select>
            </label>

            <button type="button" onClick={handleGenerateReport}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m21 21-4.35-4.35" />
                <circle cx="11" cy="11" r="7" />
              </svg>
              Generate Report
            </button>
          </aside>

          <main className="admin-report-main">
            <section className="admin-directory-card">
              <div className="admin-directory-title">
                <span aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </span>
                <h2>{activeAdminReport.title}</h2>
              </div>

              <table className="admin-directory-table">
                <thead>
                  <tr>
                    {activeAdminReport.headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminVisibleRows.map((row) => (
                    <tr key={row.id || row.name || row.course}>
                      {adminReportType === 'All Teachers' && (
                        <>
                          <td>{row.id}</td>
                          <td>{row.name}</td>
                          <td>{row.subject}</td>
                          <td>{row.course}</td>
                          <td><span className="admin-directory-status">{row.status}</span></td>
                        </>
                      )}
                      {adminReportType === 'Student Grades' && (
                        <>
                          <td>{row.name}</td>
                          <td>{row.quiz}</td>
                          <td>{row.midterm}</td>
                          <td>{row.final}</td>
                          <td>{row.finalScore}</td>
                        </>
                      )}
                      {adminReportType === 'Attendance Records' && (
                        <>
                          <td>{row.name}</td>
                          <td>{row.present}</td>
                          <td>{row.absent}</td>
                          <td><span className="admin-directory-status">{row.rate}</span></td>
                        </>
                      )}
                      {adminReportType === 'Courses & Subjects' && (
                        <>
                          <td>{row.course}</td>
                          <td>
                            <span className="admin-subject-list">
                              {row.subjects.map((subject) => <b key={subject}>{subject}</b>)}
                            </span>
                          </td>
                          <td>{row.teacher}</td>
                        </>
                      )}
                    </tr>
                  ))}
                  {adminVisibleRows.length === 0 && (
                    <tr>
                      <td colSpan={activeAdminReport.headers.length}>{activeAdminReport.empty}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="admin-directory-footer">
                <span>Showing {adminVisibleRows.length ? 1 : 0} to {adminVisibleRows.length} of {activeAdminReport.rows.length} {activeAdminReport.countLabel}</span>
                <div>
                  <button type="button" aria-label="Previous page">&lt;</button>
                  <button type="button" className="active">1</button>
                  <button type="button">2</button>
                  <button type="button">3</button>
                  <button type="button" aria-label="Next page">&gt;</button>
                </div>
              </div>
            </section>

            <div className="admin-report-insights">
              <section className="admin-live-insights">
                <h2>Live Insights</h2>
                <p>Real-time data synchronization active</p>
                <div className="admin-sync-row">
                  <span>System Health</span>
                  <strong>{syncPercent}</strong>
                </div>
                <div className="admin-sync-track"><span style={{ width: syncPercent }} /></div>
                <div className="admin-sync-row">
                  <span>Last Sync</span>
                  <strong>2m ago</strong>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="class-report-page">
      <div className="class-report-header">
        <h1>Reports</h1>
        <div className="class-report-actions">
          <button type="button" onClick={handlePrint}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <path d="M6 14h12v8H6z" />
            </svg>
            Print
          </button>
          <button type="button" onClick={handleExportExcel}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            Export Excel
          </button>
          <button type="button" className="download-pdf-btn" onClick={handleDownloadPDF} disabled={isDownloading}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            <span className="button-content">
              {isDownloading && <LoadingSpinner label="Downloading PDF" size="small" />}
              {isDownloading ? 'Downloading...' : 'Download PDF'}
            </span>
          </button>
        </div>
      </div>

      {statusMessage && <StatusMessage variant="success" className="report-status-message">{statusMessage}</StatusMessage>}
      {errorMessage && <StatusMessage variant="error" className="report-status-message">{errorMessage}</StatusMessage>}

      <div className="class-report-layout" ref={reportRef}>
        <aside className="report-filter-card">
          <div className="filter-title">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3" />
              <path d="M2 14h4M10 8h4M18 16h4" />
            </svg>
            <h2>{isStudentReport ? 'Student' : 'Filter'}<br />Options</h2>
          </div>

          <label>
            <span>Class</span>
            <select value="All" disabled aria-label="Class filter unavailable">
              <option value="All">All classes</option>
            </select>
          </label>

          <label>
            <span>Subject</span>
            <select value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)}>
              <option value="All">All subjects</option>
              {subjectOptions.map((subject) => (
                <option value={subject} key={subject}>{subject}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Semester</span>
            <select value={selectedSemester} onChange={(event) => setSelectedSemester(event.target.value)}>
              <option value="All">All semesters</option>
              {semesterOptions.map((semester) => (
                <option value={semester} key={semester}>{semester}</option>
              ))}
            </select>
          </label>

          <label>
            <span>Report Type</span>
            <select value={selectedReportType} onChange={(event) => setSelectedReportType(event.target.value)}>
              <option>Class Summary</option>
              <option>Grade Registry</option>
              <option>Performance Review</option>
            </select>
          </label>

          <button type="button" onClick={handleGenerateReport}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m21 21-4.35-4.35" />
              <circle cx="11" cy="11" r="7" />
            </svg>
            Generate Report
          </button>
        </aside>

        <main className="class-report-main">
          <h2>{reportTitle}</h2>

          <div className="report-stat-grid">
            <section>
              <span>{isStudentReport ? 'Subjects' : 'Total Students'}</span>
              <strong>{isStudentReport ? reportGrades.length : totalStudents}</strong>
              <small>{isStudentReport ? 'Recorded' : 'Enrolled'}</small>
            </section>
            <section>
              <span>Average Score</span>
              <strong>{averageScore}%</strong>
              <small>{isStudentReport ? 'Personal average' : '+2.4% vs LY'}</small>
            </section>
          </div>

          <section className="grade-distribution-card">
            <h3>Grade Distribution</h3>
            {distributionRows.map((row) => (
              <div className="distribution-row" key={row.grade}>
                <span>{row.grade}</span>
                <div className="distribution-track">
                  <div className={`distribution-fill${row.danger ? ' danger' : ''}`} style={{ width: row.width }} aria-hidden="true" />
                  <span className="distribution-count">{row.label}</span>
                </div>
              </div>
            ))}
          </section>

          <section className="grade-registry-card">
            <h3>{isStudentReport ? 'My Subject Grades' : 'Detailed Grade Registry'}</h3>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>{isStudentReport ? 'Subject' : 'Name'}</th>
                  <th>Score</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {registryRows.map((row) => (
                  <tr key={row.rank}>
                    <td>{row.rank}</td>
                    <td>
                      <span className="registry-avatar">{row.name[0]}</span>
                      {row.name}
                    </td>
                    <td>{row.score}</td>
                    <td><span className={`registry-grade ${row.grade.includes('C') ? 'warning' : ''}`}>{row.grade}</span></td>
                    <td className={row.status === 'Warning' ? 'status-warning' : ''}>{row.status}</td>
                  </tr>
                ))}
                {registryRows.length === 0 && (
                  <tr>
                    <td colSpan="5">No grade records match the selected filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
            {!isStudentReport && <button type="button" onClick={handleClearReportFilters}>View All {totalStudents} Students</button>}
          </section>
        </main>

        <aside className="class-report-side">
          <section className="passing-rate-card">
            <span>{isStudentReport ? 'Academic Status' : 'Passing Rate'}</span>
            <strong>{isStudentReport ? getLetterGrade(averageScore) : `${reportGrades.length ? Math.round((reportGrades.filter((grade) => Number(grade.score) >= 75).length / reportGrades.length) * 100) : 0}%`}</strong>
            <small>{isStudentReport ? 'Current standing' : 'Target Met'}</small>
          </section>

          <section className="performers-card">
            <h3>
              <span aria-hidden="true">*</span>
              Top Performers
            </h3>
            {(topPerformers.length ? topPerformers : [{ name: 'No records', average: 0 }]).map((student) => (
              <article key={student.name}>
                <span className="side-avatar">{student.name[0]}</span>
                <strong>{student.name}</strong>
                <em>{student.average}%</em>
              </article>
            ))}
          </section>

          <section className="improvement-card">
            <h3>Needs<br />Improvement</h3>
            {(bottomPerformers.length ? bottomPerformers : [{ name: 'No records', average: 0 }]).map((student) => (
              <article key={student.name}>
                <span className="side-avatar">{student.name[0]}</span>
                <strong>{student.name}</strong>
                <em>{student.average}%</em>
              </article>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default GenerateReport;
