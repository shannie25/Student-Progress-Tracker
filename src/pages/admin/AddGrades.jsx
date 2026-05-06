import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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

const AddGrades = () => {
  const { users, addGrade } = useAuth();
  const students = users.filter((user) => user.role === 'student');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || fallbackRows[0].id);
  const [scores, setScores] = useState({
    quiz1: '18',
    quiz2: '',
    assignment: '20',
    midterm: '',
    final: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const selectedStudent = useMemo(() => {
    return students.find((student) => String(student.id) === String(selectedStudentId)) || fallbackRows[0];
  }, [selectedStudentId, students]);

  const rows = students.length
    ? students.slice(0, 3).map((student, index) => fallbackRows[index] || {
        id: student.id,
        name: student.name,
        quiz: 0,
        assignment: 0,
        midterm: 0,
        final: 0,
        total: '0.0',
        grade: 'F',
      })
    : fallbackRows;

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
    const numericValue = value === '' ? '' : Math.min(Number(value), activity.max);
    setScores((currentScores) => ({
      ...currentScores,
      [activity.id]: numericValue === '' ? '' : String(Math.max(numericValue, 0)),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasCompleteScores) {
      return;
    }

    try {
      setIsSaving(true);
      await addGrade({
        studentId: selectedStudentId,
        subject: 'Math',
        score: Number(finalScore),
        feedback: `Quiz 1: ${scores.quiz1}, Quiz 2: ${scores.quiz2}, Assignment: ${scores.assignment}, Midterm: ${scores.midterm}, Final: ${scores.final}`,
      });
      setIsModalOpen(false);
    } catch {
      alert('Failed to save grade. Please check the server and database connection.');
    } finally {
      setIsSaving(false);
    }
  };

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
          <button type="button" className="grades-add-btn" onClick={() => setIsModalOpen(true)}>
            + Add Grades
          </button>
        </div>
      </div>

      <section className="grades-filter-bar" aria-label="Grade filters">
        <label>
          <span>Subject</span>
          <select defaultValue="Math">
            <option>Math</option>
            <option>English</option>
            <option>Science</option>
          </select>
        </label>
        <label>
          <span>Class</span>
          <select defaultValue="BSIT - 1A">
            <option>BSIT - 1A</option>
            <option>BSIT - 1B</option>
            <option>BSCS - 2A</option>
          </select>
        </label>
        <label>
          <span>Semester</span>
          <select defaultValue="Spring">
            <option>Spring</option>
            <option>Fall</option>
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
              <tr key={row.id}>
                <td>
                  <span className="grades-student-avatar">{row.name[0]}</span>
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
          </tbody>
        </table>

        <div className="grades-table-footer">
          <span>Showing 3 of 42 students in BSIT - 1A</span>
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

      {isModalOpen && (
        <div className="add-grades-overlay" role="presentation">
          <form className="add-grades-modal" onSubmit={handleSubmit} role="dialog" aria-modal="true" aria-labelledby="add-grades-title">
            <div className="add-grades-modal-header">
              <h2 id="add-grades-title">Add Grades - Math (BSIT - 1A)</h2>
              <button type="button" aria-label="Close add grades modal" onClick={() => setIsModalOpen(false)}>
                x
              </button>
            </div>

            <label className="add-grades-field">
              <span>Select Student</span>
              <select value={selectedStudentId} onChange={(event) => setSelectedStudentId(event.target.value)}>
                {(students.length ? students : fallbackRows).map((student) => (
                  <option key={student.id} value={student.id}>{student.name}</option>
                ))}
              </select>
            </label>

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
                  <strong>• {status}</strong>
                </span>
              </div>
            </div>

            <div className="add-grades-modal-actions">
              <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button type="submit" disabled={!hasCompleteScores || isSaving}>
                {isSaving ? 'Saving...' : 'Save Grades'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AddGrades;
