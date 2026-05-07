import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatName } from '../utils/formatName';

const Topbar = () => {
  const navigate = useNavigate();
  const { user, users, grades, attendance } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const trimmedQuery = searchQuery.trim();

  const searchResults = useMemo(() => {
    if (!trimmedQuery || !user) {
      return [];
    }

    const normalizedQuery = trimmedQuery.toLowerCase();
    const visibleGrades = user.role === 'student'
      ? grades.filter((grade) => grade.studentId === user.id)
      : grades;
    const visibleStudents = user.role === 'student'
      ? users.filter((currentUser) => currentUser.id === user.id)
      : users.filter((currentUser) => currentUser.role === 'student');
    const matches = (...fields) => fields
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(normalizedQuery));
    const pageItems = [
      { label: 'Dashboard', description: 'Overview, GPA, attendance, and class insights', to: '/dashboard', keywords: 'home overview academic performance' },
      { label: user.role === 'teacher' ? 'Classes' : 'Grades', description: 'Subjects, scores, and grade records', to: '/add-grades', keywords: 'grades subjects scores records' },
      { label: 'Students', description: 'Assigned student list and profiles', to: '/students', keywords: 'students profiles class', visible: user.role === 'teacher' },
      { label: 'Attendance', description: 'Attendance records and status', to: '/attendance', keywords: 'attendance present absent late', visible: user.role !== 'teacher' },
      { label: 'Grades Management', description: 'Teacher grade entry and registry', to: '/grades-management', keywords: 'teacher grades management entry', visible: user.role === 'teacher' },
      { label: 'Reports', description: 'Generate class and student reports', to: '/generate-report', keywords: 'report pdf excel class summary' },
      { label: 'Users', description: 'Admin accounts, roles, and system users', to: '/manage-users#users', keywords: 'admin users accounts roles add user', visible: user.role === 'admin' },
      { label: 'Courses', description: 'Course and subject setup', to: '/manage-users#courses', keywords: 'admin courses subjects create course', visible: user.role === 'admin' },
      { label: 'Grade Scale', description: 'Rubrics and score ranges', to: '/manage-users#grade-scale', keywords: 'admin grade scale rubric score ranges', visible: user.role === 'admin' },
      { label: 'Audit Logs', description: 'Admin activity history', to: '/manage-users#audit-logs', keywords: 'admin audit logs activity history', visible: user.role === 'admin' },
    ]
      .filter((item) => item.visible !== false)
      .filter((item) => matches(item.label, item.description, item.keywords))
      .map((item) => ({ ...item, type: 'Page' }));
    const studentItems = visibleStudents
      .filter((student) => matches(student.name, student.id, 'student profile records grades attendance'))
      .map((student) => ({
        type: 'Student',
        label: formatName(student.name),
        description: `ID ${student.id}`,
        to: user.role === 'teacher' ? `/students/${student.id}` : user.role === 'admin' ? '/manage-users#users' : '/dashboard',
      }));
    const subjectGroups = visibleGrades.reduce((groups, grade) => {
      const subject = grade.subject || 'Untitled Subject';
      const currentGroup = groups[subject] || { subject, count: 0, feedback: [] };

      currentGroup.count += 1;
      if (grade.feedback) {
        currentGroup.feedback.push(grade.feedback);
      }

      groups[subject] = currentGroup;
      return groups;
    }, {});
    const subjectItems = Object.values(subjectGroups)
      .filter((subject) => matches(subject.subject, subject.feedback.join(' '), 'subject grade score academic record'))
      .map((subject) => ({
        type: 'Subject',
        label: subject.subject,
        description: `${subject.count} grade record${subject.count === 1 ? '' : 's'}`,
        to: user.role === 'teacher' ? '/grades-management' : user.role === 'admin' ? '/manage-users#courses' : '/add-grades',
      }));
    const visibleAttendance = user.role === 'student'
      ? attendance.filter((record) => record.studentId === user.id)
      : attendance;
    const attendanceItems = user.role !== 'teacher' && matches('attendance records present absent late', visibleAttendance.map((record) => record.status).join(' '))
      ? [{
          type: 'Record',
          label: 'Attendance Records',
          description: `${visibleAttendance.length} attendance record${visibleAttendance.length === 1 ? '' : 's'}`,
          to: '/attendance',
        }]
      : [];

    return [...pageItems, ...studentItems, ...subjectItems, ...attendanceItems].slice(0, 8);
  }, [attendance, grades, trimmedQuery, user, users]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (searchResults.length === 0) {
      return;
    }

    handleResultSelect(searchResults[0]);
  };

  const handleResultSelect = (result) => {
    navigate(result.to);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <header className="topbar">
      <form className="topbar-search" role="search" onSubmit={handleSearchSubmit}>
        <span className="topbar-search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m21 21-4.35-4.35" />
            <circle cx="11" cy="11" r="7" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search academic records..."
          aria-label="Search academic records"
          value={searchQuery}
          onChange={(event) => {
            setSearchQuery(event.target.value);
            setIsSearchOpen(true);
          }}
          onFocus={() => setIsSearchOpen(true)}
          onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 120)}
        />

        {trimmedQuery && isSearchOpen && (
          <div className="topbar-search-results" aria-label="Search results">
            {searchResults.length > 0 ? searchResults.map((result) => (
              <button
                key={`${result.type}-${result.label}-${result.to}`}
                type="button"
                className="topbar-search-result"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleResultSelect(result)}
              >
                <span>{result.type}</span>
                <strong>{result.label}</strong>
                <small>{result.description}</small>
              </button>
            )) : (
              <p className="topbar-search-empty">No matching records found.</p>
            )}
          </div>
        )}
      </form>

      <div className="topbar-actions" aria-label="Dashboard shortcuts">
        <button type="button" aria-label="Notifications">
          <svg viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        <button type="button" aria-label="Calendar">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        </button>
        <button type="button" aria-label="Messages">
          <svg viewBox="0 0 24 24">
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
