import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TeacherStudents.css';

const TeacherStudentProfile = () => {
  const navigate = useNavigate();
  const [showEditGrades, setShowEditGrades] = useState(false);
  const [showAddFeedback, setShowAddFeedback] = useState(false);

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
          <span className="profile-avatar">A</span>
          <span>
            <strong>Alessa Arong</strong>
            <small>ID: 2024 - 0015</small>
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

      <div className="profile-summary-grid">
        <section className="profile-summary-card">
          <span className="profile-tag">Enrolled</span>
          <p>Current Class</p>
          <strong>BSIT -1A</strong>
        </section>
        <section className="profile-summary-card">
          <span className="profile-tag">Top 5%</span>
          <p>Avg Score</p>
          <strong>95 %</strong>
        </section>
        <section className="profile-summary-card">
          <span className="profile-tag standing">Standing</span>
          <p>Status</p>
          <strong>Passed</strong>
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
              <tr>
                <td>Math</td>
                <td>Dr. Aris V.</td>
                <td>95</td>
                <td><span>A</span></td>
              </tr>
              <tr>
                <td>English</td>
                <td>Prof. Clara M.</td>
                <td>89</td>
                <td><span>B+</span></td>
              </tr>
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
            <p>"Excellent performance across subjects."</p>
            <small>Academic Supervisor, Jan 2024</small>
          </div>
        </section>

        <section>
          <h2>Growth Insight</h2>
          <div className="growth-card">
            <span className="growth-thumb">A</span>
            <div>
              <strong>Projected Milestone</strong>
              <p>Based on current scores, Alessa is on track to receive the Academic Excellence Award for the first semester.</p>
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
              <h2 id="edit-grades-title">Edit Grades - Alessa Arong</h2>
              <p>Mathematics (Calculus I)</p>
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
                {[
                  { activity: 'Quiz 1', score: 20, max: 20 },
                  { activity: 'Quiz 2', score: 18, max: 20 },
                  { activity: 'Midterm Exam', score: 45, max: 50 },
                  { activity: 'Final Exam', score: 90, max: 100 },
                ].map((grade) => (
                  <tr key={grade.activity}>
                    <td>{grade.activity}</td>
                    <td><span>{grade.score}</span></td>
                    <td>{grade.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="edit-grades-summary">
              <div>
                <p>Cumulative Total</p>
                <strong>95 %</strong>
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
              <button type="button" className="edit-grades-save">Save Changes</button>
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
              <h2 id="feedback-modal-title">Add Feedback - Alessa Arong</h2>
              <p>Mathematics (Calculus I)</p>
            </header>

            <div className="feedback-recipient">
              <span className="feedback-recipient-avatar">A</span>
              <span>
                <small>Recipient</small>
                <strong>Alessa Arong</strong>
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
              <button type="button" className="feedback-save-btn">Save Feedback</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default TeacherStudentProfile;
