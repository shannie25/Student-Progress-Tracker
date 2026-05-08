import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatName } from '../utils/formatName';

const Topbar = () => {
  const navigate = useNavigate();
  const { user, users, grades, attendance } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePanel, setActivePanel] = useState('');
  const trimmedQuery = searchQuery.trim();
  const visibleGrades = user?.role === 'student'
    ? grades.filter((grade) => grade.studentId === user.id)
    : grades;
  const visibleAttendance = user?.role === 'student'
    ? attendance.filter((record) => record.studentId === user.id)
    : attendance;
  const latestGrade = visibleGrades[0];
  const latestAttendance = visibleAttendance[0];

  const notificationItems = [
    latestGrade && {
      title: user.role === 'student' ? 'New grade record' : 'Grade records updated',
      description: `${latestGrade.subject || 'Subject'} ${latestGrade.score != null ? `- ${latestGrade.score}%` : 'is ready for review'}`,
      to: user.role === 'admin' ? '/manage-users#grade-scale' : user.role === 'teacher' ? '/grades-management' : '/add-grades',
    },
    latestAttendance && user.role !== 'teacher' && {
      title: 'Attendance updated',
      description: `${latestAttendance.status || 'Record'} status logged${latestAttendance.date ? ` for ${new Date(latestAttendance.date).toLocaleDateString()}` : ''}.`,
      to: '/attendance',
    },
    {
      title: user.role === 'admin' ? 'Admin tools ready' : user.role === 'teacher' ? 'Class insights ready' : 'Academic report ready',
      description: user.role === 'admin' ? 'Review users, courses, reports, and grading settings.' : user.role === 'teacher' ? 'Open your class dashboard for current learning signals.' : 'Generate your latest academic summary.',
      to: user.role === 'admin' ? '/manage-users#users' : user.role === 'teacher' ? '/dashboard' : '/generate-report',
    },
  ].filter(Boolean);

  const calendarItems = [
    {
      title: 'Today',
      description: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      to: '/dashboard',
    },
    user.role !== 'teacher' && {
      title: 'Attendance calendar',
      description: `${visibleAttendance.length} attendance record${visibleAttendance.length === 1 ? '' : 's'} available.`,
      to: '/attendance',
    },
    {
      title: user.role === 'teacher' ? 'Grade review schedule' : 'Report schedule',
      description: user.role === 'teacher' ? 'Review class grades and students needing attention.' : 'Open reports for the current semester.',
      to: user.role === 'teacher' ? '/grades-management' : '/generate-report',
    },
  ].filter(Boolean);

  const messageItems = [
    {
      title: user.role === 'admin' ? 'System notice' : user.role === 'teacher' ? 'Class advisory' : 'Instructor feedback',
      description: user.role === 'admin' ? 'Audit logs and account changes are available.' : user.role === 'teacher' ? 'Students with lower averages are flagged in your dashboard.' : 'Feedback appears beside your grade records.',
      to: user.role === 'admin' ? '/manage-users#audit-logs' : user.role === 'teacher' ? '/students' : '/add-grades',
    },
    {
      title: 'Reports',
      description: 'Open the reports page to export PDF or Excel summaries.',
      to: '/generate-report',
    },
  ];

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
    setActivePanel('');
  };

  const handlePanelItemSelect = (to) => {
    navigate(to);
    setActivePanel('');
  };

  const renderActionPanel = (panelName, title, items) => {
    if (activePanel !== panelName) {
      return null;
    }

    return (
      <div className="topbar-action-panel" role="menu" aria-label={title}>
        <strong>{title}</strong>
        {items.map((item) => (
          <button key={`${panelName}-${item.title}-${item.to}`} type="button" onClick={() => handlePanelItemSelect(item.to)}>
            <span>{item.title}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </div>
    );
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
        <div className="topbar-action-wrap">
          <button type="button" aria-label="Notifications" aria-expanded={activePanel === 'notifications'} onClick={() => setActivePanel((currentPanel) => currentPanel === 'notifications' ? '' : 'notifications')}>
            {notificationItems.length > 0 && <span className="topbar-action-dot" aria-hidden="true" />}
          <svg viewBox="0 0 24 24">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          </button>
          {renderActionPanel('notifications', 'Notifications', notificationItems)}
        </div>
        <div className="topbar-action-wrap">
          <button type="button" aria-label="Calendar" aria-expanded={activePanel === 'calendar'} onClick={() => setActivePanel((currentPanel) => currentPanel === 'calendar' ? '' : 'calendar')}>
          <svg viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          </button>
          {renderActionPanel('calendar', 'Calendar', calendarItems)}
        </div>
        <div className="topbar-action-wrap">
          <button type="button" aria-label="Messages" aria-expanded={activePanel === 'messages'} onClick={() => setActivePanel((currentPanel) => currentPanel === 'messages' ? '' : 'messages')}>
          <svg viewBox="0 0 24 24">
            <path d="M21 15a4 4 0 0 1-4 4H7l-4 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
          </svg>
          </button>
          {renderActionPanel('messages', 'Messages', messageItems)}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
