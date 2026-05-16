import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from '../components/UserAvatar';
import { formatName } from '../utils/formatName';
import './TeacherStudents.css';

const TeacherStudents = () => {
  const navigate = useNavigate();
  const { user, users, grades, teacherAssignments } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [studentGroup, setStudentGroup] = useState('Assigned');
  const teacherStudentIds = new Set(teacherAssignments.filter((assignment) => assignment.teacherId === user.id).map((assignment) => assignment.studentId));
  const assignedStudents = users.filter((currentUser) => currentUser.role === 'student' && teacherStudentIds.has(currentUser.id));
  const students = assignedStudents.map((student) => {
        const studentGrades = grades.filter((grade) => grade.studentId === student.id);
        const studentSubjects = teacherAssignments
          .filter((assignment) => assignment.teacherId === user.id && assignment.studentId === student.id)
          .map((assignment) => assignment.subject);
        const className = Array.from(new Set(studentSubjects)).join(', ') || 'Assigned';
        const hasGrades = studentGrades.length > 0;
        const averageScore = hasGrades
          ? Math.round(studentGrades.reduce((total, grade) => total + Number(grade.score || 0), 0) / studentGrades.length)
          : 0;

        return {
          name: student.name,
          id: student.id,
          profilePicture: student.profilePicture,
          className,
          score: hasGrades ? `${averageScore} /100` : '-- /100',
          status: hasGrades ? (averageScore < 75 ? 'At Risk' : 'Passing') : 'No Grades',
        };
      });
  const filteredStudents = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      const matchesGroup = studentGroup === 'Assigned' || student.className === studentGroup;
      const matchesSearch = !normalizedQuery
        || [student.name, formatName(student.name), student.id, student.className, student.score, student.status]
          .some((value) => String(value).toLowerCase().includes(normalizedQuery));

      return matchesGroup && matchesSearch;
    });
  }, [searchQuery, studentGroup, students]);
  const hasStudentFilters = Boolean(searchQuery.trim()) || studentGroup !== 'Assigned';

  return (
    <div className="teacher-students-page">
      <h1>Students</h1>

      <div className="teacher-students-controls">
        <label className="teacher-students-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.35-4.35" />
            <circle cx="11" cy="11" r="7" />
          </svg>
          <input
            type="text"
            placeholder="Search students..."
            aria-label="Search students"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        <label className="teacher-students-select">
          <select value={studentGroup} aria-label="Select student group" onChange={(event) => setStudentGroup(event.target.value)}>
            <option value="Assigned">Assigned students</option>
          </select>
        </label>
      </div>

      <section className="students-cohort-card">
        <h2>Active cohort: {studentGroup === 'Assigned' ? 'Assigned students' : studentGroup}</h2>

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
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td data-label="Student Identity">
                  <UserAvatar user={student} className="students-avatar" fallback="S" />
                  <span className="students-identity">
                    <strong>{formatName(student.name)}</strong>
                    <small>ID : {student.id}</small>
                  </span>
                </td>
                <td data-label="Class">{student.className}</td>
                <td data-label="Avg Score">{student.score}</td>
                <td data-label="Academic Status">
                  <span className={`students-status ${student.status === 'At Risk' ? 'risk' : student.status === 'No Grades' ? 'pending' : ''}`}>
                    {student.status}
                  </span>
                </td>
                <td data-label="Actions">
                  <button type="button" className="students-profile-btn" onClick={() => navigate(`/students/${student.id}`)}>
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan="5">{searchQuery.trim() ? 'No students match your search.' : 'No assigned students yet.'}</td>
              </tr>
            )}
          </tbody>
        </table>

        <button
          type="button"
          className="students-show-all"
          disabled={!hasStudentFilters}
          onClick={() => {
            setSearchQuery('');
            setStudentGroup('Assigned');
          }}
        >
          {hasStudentFilters ? 'Show all assigned students' : `Showing ${filteredStudents.length} of ${students.length} assigned student${students.length === 1 ? '' : 's'}`}
          <span aria-hidden="true">v</span>
        </button>
      </section>
    </div>
  );
};

export default TeacherStudents;
