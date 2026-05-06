import React from 'react';
import { useAuth } from '../context/AuthContext';
import { formatName } from '../utils/formatName';
import './Dashboard.css';

const Dashboard = () => {
  const { user, grades, users } = useAuth();

  const studentGrades = user.role === 'student'
    ? grades.filter((grade) => grade.studentId === user.id)
    : grades;

  const mockGrades = [
    { id: 1, subject: 'Advanced Typography', professor: 'Prof. Elena Vance', score: 92, feedback: 'Excellent use of modular grid systems and hierarchy.' },
    { id: 2, subject: 'Digital Interface Design', professor: 'Dr. Julian Thorne', score: 96, feedback: 'Strong conceptual depth in UI and interaction choices.' },
    { id: 3, subject: 'Human - Computer Interaction', professor: 'Dr. Julian Thorne', score: 88, feedback: 'Research phase and usability inspection were clear.' },
  ];

  const displayGrades = studentGrades.length > 0 ? studentGrades : mockGrades;

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

  const mockFeedback = [
    {
      id: 1,
      teacher: 'Prof. Vance',
      message: "Crist's attention to whitespace and layout hierarchy in the latest project was exemplary. Truly thinking like a professional.",
    },
    {
      id: 2,
      teacher: 'Dr. Thorne',
      message: 'Consistent improvement in system-level thinking. The user flows are becoming much more intuitive.',
    },
  ];

  const gradeHistory = [
    { semester: 'Semester 1, 2024', date: 'Completed on July 15, 2024', gpa: '3.65' },
    { semester: 'Semester 2, 2023', date: 'Completed on December 20, 2023', gpa: '3.72' },
  ];

  if (user.role === 'teacher') {
    const teacherName = formatName(user?.name) || 'Prof. Reyes';
    const teacherStudents = users.filter((currentUser) => currentUser.role === 'student');
    const totalStudents = teacherStudents.length || 40;
    const teacherAverage = grades.length > 0
      ? Math.round(grades.reduce((total, grade) => total + (grade.score || 0), 0) / grades.length)
      : 88;

    const topStudents = [
      { name: 'Annie', note: 'Exception Homework Completion', score: '95%', status: 'Mastery' },
      { name: 'Alessa', note: 'Strong Analytic Skills', score: '94%', status: 'Mastery' },
    ];

    const needsImprovement = [
      { name: 'Credo', note: 'Low Participation Rate', score: '72%', status: 'At Risk' },
      { name: 'Chad', note: 'Missing Last 2 Assignments', score: '72%', status: 'At Risk' },
    ];

    const gradeDistribution = [
      { letter: 'A', value: 68, color: '#6556f4' },
      { letter: 'B', value: 100, color: '#6556f4' },
      { letter: 'C', value: 78, color: '#6556f4' },
      { letter: 'D', value: 34, color: '#858585' },
      { letter: 'F', value: 22, color: '#ff1010' },
    ];

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
                      <td data-label="Action"><a href="#" className="view-link">View</a></td>
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
                <p className="metric-value">120</p>
              </div>
              <div className="metric">
                <p className="metric-label present">Present</p>
                <p className="metric-value">41</p>
              </div>
              <div className="metric">
                <p className="metric-label absent">Absent</p>
                <p className="metric-value">10</p>
              </div>
            </div>
          </section>

          <section className="feedback-section">
            <h2>Teacher Feedback</h2>
            <div className="feedback-list">
              {mockFeedback.map((feedback) => (
                <div key={feedback.id} className="feedback-item">
                  <p className="feedback-text">"{feedback.message}"</p>
                  <p className="feedback-teacher">
                    <span aria-hidden="true">A</span>
                    - {feedback.teacher}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="card records-card">
            <h2>Academic Records</h2>
            <div className="records-actions">
              <button className="record-btn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 15h6M12 12v6" />
                </svg>
                Download PDF
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </button>
              <button className="record-btn">
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
