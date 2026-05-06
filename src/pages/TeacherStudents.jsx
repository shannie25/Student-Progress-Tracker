import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatName } from '../utils/formatName';
import './TeacherStudents.css';

const TeacherStudents = () => {
  const navigate = useNavigate();
  const students = [
    { name: 'Annie', id: '2024 - 0012', className: 'BSIT -1A', score: '95 /100', status: 'Passing' },
    { name: 'Alessa', id: '2024 - 0015', className: 'BSIT -1A', score: '91 /100', status: 'Passing' },
    { name: 'Credo', id: '2024 - 0015', className: 'BSIT -1A', score: '72 /100', status: 'At Risk' },
  ];

  return (
    <div className="teacher-students-page">
      <h1>Students</h1>

      <div className="teacher-students-controls">
        <label className="teacher-students-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.35-4.35" />
            <circle cx="11" cy="11" r="7" />
          </svg>
          <input type="text" placeholder="Search students..." aria-label="Search students" />
        </label>

        <label className="teacher-students-select">
          <select defaultValue="BSIT -1A" aria-label="Select class">
            <option>BSIT -1A</option>
            <option>BSIT -1B</option>
            <option>BSCS -2A</option>
          </select>
        </label>
      </div>

      <section className="students-cohort-card">
        <h2>Active cohort: BSIT - 1A</h2>

        <table className="students-table">
          <thead>
            <tr>
              <th>Student Identity</th>
              <th>Class</th>
              <th>Avg Score</th>
              <th>Academic Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.name}>
                <td data-label="Student Identity">
                  <span className="students-avatar">{student.name[0]}</span>
                  <span className="students-identity">
                    <strong>{formatName(student.name)}</strong>
                    <small>ID : {student.id}</small>
                  </span>
                </td>
                <td data-label="Class">{student.className}</td>
                <td data-label="Avg Score">{student.score}</td>
                <td data-label="Academic Status">
                  <span className={`students-status ${student.status === 'At Risk' ? 'risk' : ''}`}>
                    {student.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <button type="button" className="students-profile-btn" onClick={() => navigate('/students/alessa')}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="students-show-all">
          Show All Students
          <span aria-hidden="true">v</span>
        </button>
      </section>
    </div>
  );
};

export default TeacherStudents;
