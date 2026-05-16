import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { StatusMessage } from '../components/ui';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '../hooks/useAuth';
import { useStatusToast } from '../hooks/useNotifications';
import { exportStructuredPdf } from '../utils/pdfExport';
import './TeacherStudents.css';

const getLetterGrade = (score = 0) => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C';
  return 'F';
};

const TeacherStudentProfile = () => {
  const navigate = useNavigate();
  const { studentId } = useParams();
  const { users, grades, editGrade } = useAuth();
  const [showEditGrades, setShowEditGrades] = useState(false);
  const [showAddFeedback, setShowAddFeedback] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  useStatusToast(successMessage, 'success', 'Student profile updated');
  useStatusToast(errorMessage, 'error', 'Student profile issue');
  const student = users.find((currentUser) => currentUser.id === studentId) || {
    id: studentId || '2024-0015',
    name: 'Alessa Arong',
  };
  const studentGrades = grades.filter((grade) => grade.studentId === student.id);
  const displayGrades = studentGrades;
  const hasGrades = displayGrades.length > 0;
  const averageScore = hasGrades
    ? Math.round(displayGrades.reduce((total, grade) => total + Number(grade.score || 0), 0) / displayGrades.length)
    : 0;
  const academicStatus = hasGrades ? (averageScore >= 75 ? 'Passed' : 'At Risk') : 'No Grades';
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

  const handleExportReport = () => {
    try {
      setSuccessMessage('');
      setErrorMessage('');
      exportStructuredPdf({
        filename: `Student_Profile_${student.id}.pdf`,
        title: `Student Profile - ${student.name}`,
        subtitle: 'Academic profile generated from recorded grade data.',
        meta: [
          { label: 'Student ID', value: student.id },
          { label: 'Status', value: academicStatus },
        ],
        summary: [
          { label: 'Current Class', value: 'Assigned' },
          { label: 'Average Score', value: hasGrades ? `${averageScore}%` : 'No Grades' },
          { label: 'Standing', value: academicStatus },
        ],
        sections: [
          {
            title: 'Subject Performance',
            columns: [
              { header: 'Subject', accessor: 'subject', width: 1.4 },
              { header: 'Instructor', accessor: (grade) => grade.teacherId || 'Assigned teacher', width: 1.2 },
              { header: 'Score', accessor: (grade) => `${Number(grade.score).toFixed(1)}/100`, width: 0.7 },
              { header: 'Grade', accessor: (grade) => getLetterGrade(Number(grade.score)), width: 0.6 },
              { header: 'Feedback', accessor: (grade) => grade.feedback || 'No feedback yet', width: 1.5 },
            ],
            rows: displayGrades,
            emptyMessage: 'No grade records yet.',
          },
        ],
      });
      setSuccessMessage('Student profile report downloaded successfully.');
    } catch {
      setErrorMessage('We could not export this student profile. Please try again.');
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
          <UserAvatar user={student} className="profile-avatar" fallback="S" />
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
          <button type="button" className="profile-export-btn" onClick={handleExportReport}>
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
          <span className="profile-tag">{hasGrades ? 'Recorded' : 'Pending'}</span>
          <p>Avg Score</p>
          <strong>{hasGrades ? `${averageScore} %` : '--'}</strong>
        </section>
        <section className="profile-summary-card">
          <span className={`profile-tag standing ${!hasGrades ? 'pending' : averageScore < 75 ? 'risk' : ''}`.trim()}>Standing</span>
          <p>Status</p>
          <strong>{academicStatus}</strong>
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
                  <td><span>{getLetterGrade(Number(grade.score))}</span></td>
                </tr>
              ))}
              {displayGrades.length === 0 && (
                <tr>
                  <td colSpan="4">No grade records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="profile-attendance-card">
          <h2>Grade Snapshot</h2>
          <div>
            <strong>{hasGrades ? `${averageScore} %` : '--'}</strong>
            <small>Average</small>
          </div>
          <dl>
            <span>
              <dt>Passing</dt>
              <dd>{displayGrades.filter((grade) => Number(grade.score) >= 75).length}</dd>
            </span>
            <span>
              <dt>Needs Work</dt>
              <dd>{displayGrades.filter((grade) => Number(grade.score) < 75).length}</dd>
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
            <UserAvatar user={student} className="growth-thumb" fallback="S" />
            <div>
              <strong>Projected Milestone</strong>
              <p>{hasGrades ? `Based on current scores, ${student.name} is ${averageScore >= 75 ? 'on track' : 'marked for follow-up'} this semester.` : `${student.name} has no recorded grades yet.`}</p>
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
                <strong>{hasGrades ? `${averageScore} %` : 'N/A'}</strong>
              </div>
              <div>
                <p>Letter Grade</p>
                <strong>
                  {hasGrades ? getLetterGrade(averageScore) : 'N/A'}
                  {hasGrades && <span>{averageScore >= 90 ? 'Excellent' : averageScore >= 75 ? 'Passing' : 'Needs Work'}</span>}
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
              <UserAvatar user={student} className="feedback-recipient-avatar" fallback="S" />
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
