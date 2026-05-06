import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusMessage } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import './TeacherStudents.css';

const TeacherStudentProfile = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { users, grades, editGrade } = useAuth();
  const [showEditGrades, setShowEditGrades] = useState(false);
  const [showAddFeedback, setShowAddFeedback] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const student = users.find((currentUser) => currentUser.id === studentId) || {
    id: studentId || '2024-0015',
    name: 'Alessa Arong',
  };
  const studentGrades = grades.filter((grade) => grade.studentId === student.id);
  const displayGrades = studentGrades.length > 0
    ? studentGrades
    : [
        { id: 0, subject: 'Math', score: 95, feedback: 'Excellent performance across subjects.' },
        { id: -1, subject: 'English', score: 89, feedback: 'Strong writing progress.' },
      ];
  const averageScore = Math.round(displayGrades.reduce((total, grade) => total + Number(grade.score || 0), 0) / displayGrades.length);
  const primaryGrade = studentGrades[0];

  const handleSaveGrades = async () => {
    if (!primaryGrade) {
      setShowEditGrades(false);
      setErrorMessage('No saved grade is available to edit yet. Add a grade first, then edit it here.');
      return;
    }

    try {
      await editGrade(primaryGrade.id, {
        subject: primaryGrade.subject,
        score: primaryGrade.score,
        feedback: primaryGrade.feedback || 'Updated after teacher review.',
      });
      setShowEditGrades(false);
      setErrorMessage('');
      setSuccessMessage('Grade changes were saved successfully.');
    } catch {
      setErrorMessage('We could not save the grade changes. Please try again.');
    }
  };

  const handleSaveFeedback = async () => {
    if (!primaryGrade) {
      setShowAddFeedback(false);
      setErrorMessage('No saved grade is available for feedback yet. Add a grade first, then add feedback here.');
      return;
    }

    try {
      await editGrade(primaryGrade.id, {
        subject: primaryGrade.subject,
        score: primaryGrade.score,
        feedback: 'Great performance. Keep it up!',
      });
      setShowAddFeedback(false);
      setErrorMessage('');
      setSuccessMessage('Feedback was saved successfully.');
    } catch {
      setErrorMessage('We could not save the feedback. Please try again.');
    }
  };

  return (
    <div className="student-profile-page">
      <button type="button" className="profile-back-btn" onClick={() => navigate('/students')} aria-label="Back to students">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      </button>

      <div className="profile-header">
        <div className="profile-identity">
          <span className="profile-avatar">{student.name?.[0] || 'S'}</span>
          <span>
            <strong>{student.name}</strong>
            <small>ID: {student.id}</small>
          </span>
        </div>

        <div className="profile-actions">
          <button type="button" onClick={() => setShowEditGrades(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            Edit Grades
          </button>
          <button type="button" onClick={() => setShowAddFeedback(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
            </svg>
            Add Feedback
          </button>
          <button type="button" className="profile-export-btn">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {successMessage && <StatusMessage variant="success" className="profile-status-message">{successMessage}</StatusMessage>}
      {errorMessage && <StatusMessage variant="error" className="profile-status-message">{errorMessage}</StatusMessage>}

      <div className="profile-summary-grid">
        <section className="profile-summary-card">
          <span className="profile-tag">Enrolled</span>
          <p>Current Class</p>
          <strong>Assigned</strong>
        </section>
        <section className="profile-summary-card">
          <span className="profile-tag">Top 5%</span>
          <p>Avg Score</p>
          <strong>{averageScore || 0} %</strong>
        </section>
        <section className="profile-summary-card">
          <span className="profile-tag standing">Standing</span>
          <p>Status</p>
          <strong>{averageScore >= 75 || displayGrades.length === 0 ? 'Passed' : 'At Risk'}</strong>
        </section>
      </div>

      <div className="profile-main-grid">
        <section className="subject-performance">
          <h2>Subject Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Instructor</th>
                <th>Score</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {displayGrades.map((grade) => (
                <tr key={grade.id}>
                  <td>{grade.subject}</td>
                  <td>{grade.teacherId || 'Assigned teacher'}</td>
                  <td>{Number(grade.score).toFixed(1)}</td>
                  <td><span>{Number(grade.score) >= 90 ? 'A' : Number(grade.score) >= 80 ? 'B' : Number(grade.score) >= 75 ? 'C' : 'F'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="profile-attendance-card">
          <h2>Attendance</h2>
          <div>
            <strong>92 %</strong>
            <small>Rate</small>
          </div>
          <dl>
            <span>
              <dt>Present</dt>
              <dd>92</dd>
            </span>
            <span>
              <dt>Absent</dt>
              <dd>8</dd>
            </span>
          </dl>
        </section>
      </div>

      <div className="profile-bottom-grid">
        <section>
          <h2>Academic Feedback</h2>
          <div className="profile-feedback-card">
            <span className="feedback-quote">"</span>
            <p>{primaryGrade?.feedback || 'No feedback saved yet.'}</p>
            <small>{primaryGrade?.subject || 'No subject selected'}</small>
          </div>
        </section>

        <section>
          <h2>Growth Insight</h2>
          <div className="growth-card">
            <span className="growth-thumb">A</span>
            <div>
              <strong>Projected Milestone</strong>
              <p>Based on current scores, {student.name} is {averageScore >= 75 ? 'on track' : 'marked for follow-up'} this semester.</p>
            </div>
          </div>
        </section>
      </div>

      {showEditGrades && (
        <div className="edit-grades-overlay" role="presentation">
          <section className="edit-grades-modal" role="dialog" aria-modal="true" aria-labelledby="edit-grades-title">
            <button type="button" className="edit-grades-close" onClick={() => setShowEditGrades(false)} aria-label="Close edit grades">
              x
            </button>

            <header className="edit-grades-header">
              <h2 id="edit-grades-title">Edit Grades - {student.name}</h2>
              <p>{primaryGrade?.subject || 'No saved grade selected'}</p>
            </header>

            <table className="edit-grades-table">
              <thead>
                <tr>
                  <th>Activity Name</th>
                  <th>Score</th>
                  <th>Max Score</th>
                </tr>
              </thead>
              <tbody>
                {displayGrades.map((grade) => (
                  <tr key={grade.id}>
                    <td>{grade.term || grade.subject}</td>
                    <td><span>{Number(grade.score).toFixed(1)}</span></td>
                    <td>100</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="edit-grades-summary">
              <div>
                <p>Cumulative Total</p>
                <strong>{averageScore || 0} %</strong>
              </div>
              <div>
                <p>Letter Grade</p>
                <strong>
                  A
                  <span>Excellent</span>
                </strong>
              </div>
            </div>

            <footer className="edit-grades-footer">
              <button type="button" onClick={() => setShowEditGrades(false)}>Cancel</button>
              <button type="button" className="edit-grades-save" onClick={handleSaveGrades}>Save Changes</button>
            </footer>
          </section>
        </div>
      )}

      {showAddFeedback && (
        <div className="feedback-modal-overlay" role="presentation">
          <section className="feedback-modal" role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title">
            <button type="button" className="feedback-modal-close" onClick={() => setShowAddFeedback(false)} aria-label="Close add feedback">
              x
            </button>

            <header className="feedback-modal-header">
              <h2 id="feedback-modal-title">Add Feedback - {student.name}</h2>
              <p>{primaryGrade?.subject || 'No saved grade selected'}</p>
            </header>

            <div className="feedback-recipient">
              <span className="feedback-recipient-avatar">{student.name?.[0] || 'S'}</span>
              <span>
                <small>Recipient</small>
                <strong>{student.name}</strong>
              </span>
            </div>

            <label className="feedback-content">
              <span>Feedback Content</span>
              <textarea defaultValue="Great Performance. Keep it up!" />
              <span className="feedback-content-icons" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <path d="M9 9h.01M15 9h.01" />
                </svg>
                <svg viewBox="0 0 24 24">
                  <path d="M21.44 11.05 12 20.5a6 6 0 0 1-8.49-8.49l9.9-9.9a4 4 0 0 1 5.66 5.66l-9.9 9.9a2 2 0 0 1-2.83-2.83l8.49-8.49" />
                </svg>
              </span>
            </label>

            <div className="feedback-tags">
              <p>Performance Tags</p>
              <div>
                <span>Analytical Thinking</span>
                <span>Participation</span>
                <span>Punctual</span>
                <button type="button">+ Add Tag</button>
              </div>
            </div>

            <footer className="feedback-modal-footer">
              <button type="button" onClick={() => setShowAddFeedback(false)}>Cancel</button>
              <button type="button" className="feedback-save-btn" onClick={handleSaveFeedback}>Save Feedback</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentProfile;
