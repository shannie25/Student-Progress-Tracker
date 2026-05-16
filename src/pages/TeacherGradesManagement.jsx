import React from 'react';
import UserAvatar from '../components/UserAvatar';
import './TeacherGradesManagement.css';

const TeacherGradesManagement = () => {
  const rows = [
    { name: 'Alessa Arong', id: '2024 - 0015', quiz: 90, assignment: 95, midterm: 95, final: 96, total: '94.0', grade: 'A' },
    { name: 'Annie Mamitag', id: '2024 - 0015', quiz: 88, assignment: 92, midterm: 90, final: 94, total: '91.0', grade: 'A-' },
    { name: 'Juffiea Visitacion', id: '2024 - 0015', quiz: 70, assignment: 75, midterm: 72, final: 72, total: '72.2', grade: 'C' },
  ];

  return (
    <div className="grades-management-page">
      <div className="grades-management-header">
        <h1>Grades Management</h1>
        <div className="grades-management-actions">
          <button type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            Upload Excel
          </button>
          <button type="button">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Export
          </button>
          <button type="button" className="grades-add-btn">+ Add Grades</button>
        </div>
      </div>

      <section className="grades-filter-bar">
        <label>
          <span>Subject</span>
          <select defaultValue="Math">
            <option>Math</option>
            <option>English</option>
          </select>
        </label>
        <label>
          <span>Class</span>
          <select defaultValue="BSIT - 1A">
            <option>BSIT - 1A</option>
            <option>BSIT - 1B</option>
          </select>
        </label>
        <label>
          <span>Semester</span>
          <select defaultValue="1st Semester">
            <option>1st Semester</option>
            <option>2nd Semester</option>
          </select>
        </label>
        <button type="button">Clear Filters</button>
      </section>

      <section className="grades-table-card">
        <table className="grades-management-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Quiz</th>
              <th>Assignment</th>
              <th>Midterm</th>
              <th>Final</th>
              <th>Total Score</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <UserAvatar name={row.name} className="grades-student-avatar" fallback="S" />
                  <span className="grades-student-info">
                    <strong>{row.name}</strong>
                    <small>ID : {row.id}</small>
                  </span>
                </td>
                <td>{row.quiz}</td>
                <td>{row.assignment}</td>
                <td>{row.midterm}</td>
                <td>{row.final}</td>
                <td className="grades-total">{row.total}</td>
                <td><span className={`grades-letter ${row.grade === 'C' ? 'low' : ''}`}>{row.grade}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="grades-table-footer">
          <span>Showing 3 of 42 students in BSIT - 1A</span>
          <div className="grades-pagination">
            <button type="button" aria-label="Previous page">{'<'}</button>
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
          <strong>85.6%</strong>
          <small>+2.4% from last semester</small>
        </section>
        <section className="grades-summary-card purple">
          <p>Top Performers</p>
          <strong>12</strong>
          <small>Students with Grade A or higher</small>
        </section>
        <section className="grades-summary-card muted">
          <p>Pending Task</p>
          <strong>04</strong>
          <small>Ungraded assignments this week</small>
        </section>
      </div>
    </div>
  );
};

export default TeacherGradesManagement;
