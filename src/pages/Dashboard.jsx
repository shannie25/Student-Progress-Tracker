import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatName } from '../utils/formatName';
import './Dashboard.css';

const Dashboard = () => {
  const { user, grades, users, attendance, classAnalytics } = useAuth();

  const studentGrades = user.role === 'student'
    ? grades.filter((grade) => grade.studentId === user.id)
    : grades;

  const displayGrades = studentGrades;

  const calculateGPA = () => {
    if (displayGrades.length === 0) return '0.0';

    const averageScore = displayGrades.reduce((total, grade) => total + (grade.score || 0), 0) / displayGrades.length;
    return (averageScore / 25).toFixed(1);
  };

  const getUniqueSubjects = () => new Set(displayGrades.map((grade) => grade.subject)).size;

  const getLetterGrade = (score = 0) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B +';
    if (score >= 70) return 'C +';
    return 'C';
  };

  const firstName = formatName(user?.name)?.split(' ')[0] || 'Crist';

  const feedbackRows = studentGrades.filter((grade) => grade.feedback).slice(0, 3);
  const gradeHistory = Object.values(studentGrades.reduce((groups, grade) => {
    const key = `${grade.schoolYear || '2025-2026'}-${grade.semester || '1st Semester'}`;
    const group = groups[key] || { semester: `${grade.semester || '1st Semester'}, ${grade.schoolYear || '2025-2026'}`, grades: [] };
    group.grades.push(grade);
    groups[key] = group;
    return groups;
  }, {})).map((group) => {
    const average = group.grades.reduce((total, grade) => total + Number(grade.score || 0), 0) / group.grades.length;
    return { ...group, gpa: (average / 25).toFixed(2) };
  });
  const studentAttendance = attendance.filter((record) => record.studentId === user.id);
  const presentAttendance = studentAttendance.filter((record) => record.status === 'present').length;
  const absentAttendance = studentAttendance.filter((record) => record.status === 'absent').length;

  if (user.role === 'teacher') {
    const teacherName = formatName(user?.name) || 'Prof. Reyes';
    const teacherStudents = users.filter((currentUser) => currentUser.role === 'student');
    const totalStudents = teacherStudents.length;
    const teacherAverage = Math.round(classAnalytics?.classAverage || 0);
    const topStudents = (classAnalytics?.topPerformers || []).map((item) => ({
      name: users.find((currentUser) => currentUser.id === item.studentId)?.name || item.studentId,
      note: 'Highest current averages',
      score: `${item.average}%`,
      status: 'Mastery',
    }));
    const needsImprovement = (classAnalytics?.bottomPerformers || []).map((item) => ({
      name: users.find((currentUser) => currentUser.id === item.studentId)?.name || item.studentId,
      note: 'Lowest current averages',
      score: `${item.average}%`,
      status: item.average < 75 ? 'At Risk' : 'Monitor',
    }));
    const distribution = classAnalytics?.distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const maxDistribution = Math.max(...Object.values(distribution), 1);
    const gradeDistribution = Object.entries(distribution).map(([letter, count]) => ({
      letter,
      value: Math.max((count / maxDistribution) * 100, count ? 16 : 4),
      color: letter === 'F' ? '#ff1010' : letter === 'D' ? '#858585' : '#6556f4',
    }));

    return (
      <div className="dashboard-container teacher-dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {teacherName}</h1>
        </div>

        <div className="teacher-stats-grid">
          <div className="teacher-stat-card">
            <span className="teacher-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="teacher-stat-trend">Active</span>
            <p className="teacher-stat-value">{totalStudents}</p>
            <p className="teacher-stat-label">Total Students Enroll</p>
          </div>

          <div className="teacher-stat-card">
            <span className="teacher-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            <span className="teacher-stat-trend">+2.4%</span>
            <p className="teacher-stat-value">{teacherAverage}%</p>
            <p className="teacher-stat-label">Class Average Grade</p>
          </div>

          <div className="teacher-stat-card teacher-stat-card-dark">
            <span className="teacher-stat-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </span>
            <span className="teacher-stat-trend">Goal Met</span>
            <p className="teacher-stat-value">92%</p>
            <p className="teacher-stat-label">Overall Passing Rate</p>
          </div>
        </div>

        <div className="teacher-insights-grid">
          <section className="teacher-card teacher-grade-card">
            <div className="teacher-card-header">
              <h2>Grade Distribution</h2>
              <span>Last Assessment</span>
            </div>
            <div className="grade-chart" aria-label="Grade distribution chart">
              {gradeDistribution.map((grade) => (
                <div key={grade.letter} className="grade-bar-item">
                  <span
                    className="grade-bar"
                    style={{ height: `${grade.value}%`, backgroundColor: grade.color }}
                  />
                  <span className="grade-letter">{grade.letter}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="teacher-card teacher-insight-card">
            <h2>Course Insights</h2>
            <p>Students are struggling with "Quadratic Equations". Consider a review session this Friday.</p>
            <button type="button">Review Session Plans {'>'}</button>
          </section>
        </div>

        <div className="teacher-student-grid">
          <section className="teacher-list-section">
            <h2>Top Students</h2>
            <div className="teacher-student-list">
              {topStudents.map((student) => (
                <div key={student.name} className="teacher-student-item">
                  <span className="teacher-student-avatar">{student.name[0]}</span>
                  <span className="teacher-student-info">
                    <strong>{student.name}</strong>
                    <small>{student.note}</small>
                  </span>
                  <span className="teacher-student-score">
                    <strong>{student.score}</strong>
                    <small>{student.status}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="teacher-list-section">
            <h2>Needs Improvement</h2>
            <div className="teacher-student-list">
              {needsImprovement.map((student) => (
                <div key={student.name} className="teacher-student-item">
                  <span className="teacher-student-avatar">{student.name[0]}</span>
                  <span className="teacher-student-info">
                    <strong>{student.name}</strong>
                    <small>{student.note}</small>
                  </span>
                  <span className="teacher-student-score teacher-student-score-risk">
                    <strong>{student.score}</strong>
                    <small>{student.status}</small>
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (user.role !== 'student') {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ color: '#1f2937', marginBottom: '24px' }}>
          {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
        </h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', background: 'white', color: '#1f2937' }}>
          <thead>
            <tr style={{ background: '#f4f4f4', textAlign: 'left' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd', color: '#1e293b', fontWeight: 600 }}>Student</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', color: '#1e293b', fontWeight: 600 }}>Subject</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', color: '#1e293b', fontWeight: 600 }}>Score</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', color: '#1e293b', fontWeight: 600 }}>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {studentGrades.map((grade) => (
              <tr key={grade.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: '#1f2937' }}>{users.find((currentUser) => currentUser.id === grade.studentId)?.name}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: '#1f2937' }}>{grade.subject}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: '#1f2937' }}>{grade.score}%</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', color: '#1f2937' }}>{grade.feedback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back, {firstName}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Cumulative GPA</h3>
          <p className="stat-value">{calculateGPA()}</p>
        </div>
        <div className="stat-card">
          <h3>Active Subjects</h3>
          <p className="stat-value">{getUniqueSubjects()}</p>
        </div>
        <div className="stat-card">
          <h3>Avg. Attendance</h3>
          <p className="stat-value">92%</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-column">
          <section className="card">
            <h2>My Subjects & Grades</h2>
            {displayGrades.length > 0 ? (
              <table className="grades-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Feedback</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayGrades.slice(0, 5).map((grade) => (
                    <tr key={grade.id}>
                      <td className="subject-cell" data-label="Subject">
                        <div className="subject-name">{grade.subject}</div>
                        {grade.professor && <div className="professor-name">{grade.professor}</div>}
                      </td>
                      <td data-label="Score">
                        <span className="score-badge">{getLetterGrade(grade.score)} ({grade.score}%)</span>
                      </td>
                      <td className="feedback-cell" data-label="Feedback">{grade.feedback || 'No feedback'}</td>
                      <td data-label="Action"><button type="button" className="view-link">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No grades available yet</p>
            )}
          </section>

          <section className="card">
            <h2>Grade History</h2>
            <div className="history-list">
              {gradeHistory.map((item) => (
                <div key={item.semester} className="history-item">
                  <span>
                    <strong>{item.semester}</strong>
                    <small>{item.date}</small>
                  </span>
                  <strong className="history-gpa">{item.gpa} GPA</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="right-column">
          <section className="card attendance-card">
            <h2>Attendance Metrics</h2>
            <div className="metrics-grid">
              <div className="metric">
                <p className="metric-label">Total</p>
                <p className="metric-value">{studentAttendance.length}</p>
              </div>
              <div className="metric">
                <p className="metric-label present">Present</p>
                <p className="metric-value">{presentAttendance}</p>
              </div>
              <div className="metric">
                <p className="metric-label absent">Absent</p>
                <p className="metric-value">{absentAttendance}</p>
              </div>
            </div>
          </section>

          <section className="feedback-section">
            <h2>Teacher Feedback</h2>
            <div className="feedback-list">
              {feedbackRows.map((feedback) => (
                <div key={feedback.id} className="feedback-item">
                  <p className="feedback-text">"{feedback.feedback}"</p>
                  <p className="feedback-teacher">
                    <span aria-hidden="true">{feedback.subject?.[0] || 'S'}</span>
                    - {feedback.subject}
                  </p>
                </div>
              ))}
              {feedbackRows.length === 0 && <p className="empty-state">No feedback available yet</p>}
            </div>
          </section>

          <section className="card records-card">
            <h2>Academic Records</h2>
            <div className="records-actions">
              <button type="button" className="record-btn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 15h6M12 12v6" />
                </svg>
                Download PDF
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </button>
              <button type="button" className="record-btn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                  <path d="M6 14h12v8H6z" />
                </svg>
                Print Report
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
