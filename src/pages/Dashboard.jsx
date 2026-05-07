import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { StatusMessage } from '../components/ui';
import { createCourse, createUser, getAuditLogs, getBackup, getCourses, getTeacherAssignments } from '../services/adminService';
import { formatName } from '../utils/formatName';
import './Dashboard.css';

const emptyAdminUserForm = {
  firstName: '',
  lastName: '',
  role: 'student',
  semester: '1st Semester',
  schoolYear: '2025-2026',
};

const emptyAdminCourseForm = {
  name: '',
  code: '',
  description: '',
  schedule: '',
  semester: '1st Semester',
  schoolYear: '2025-2026',
  teacherId: '',
};

const getRelativeTimeLabel = (dateValue) => {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  const minutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  return `${Math.round(hours / 24)}d ago`;
};

const formatAuditAction = (action = '') => {
  return action
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const loadAdminRequest = async (label, request, fallback) => {
  try {
    return { label, data: await request(), failed: false };
  } catch (error) {
    return { label, data: fallback, failed: true, message: error instanceof Error ? error.message : 'Request failed' };
  }
};

const Dashboard = () => {
  const { user, grades, users, attendance, teacherAssignments, classAnalytics, reloadData } = useAuth();
  const navigate = useNavigate();
  const [adminCourses, setAdminCourses] = useState([]);
  const [adminAssignments, setAdminAssignments] = useState([]);
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);
  const [adminStatusMessage, setAdminStatusMessage] = useState('');
  const [adminErrorMessage, setAdminErrorMessage] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [adminUserForm, setAdminUserForm] = useState(emptyAdminUserForm);
  const [adminCourseForm, setAdminCourseForm] = useState(emptyAdminCourseForm);
  const [addUserError, setAddUserError] = useState('');
  const [addCourseError, setAddCourseError] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const studentGrades = user.role === 'student'
    ? grades.filter((grade) => grade.studentId === user.id)
    : grades;
  const studentAssignments = user.role === 'student'
    ? teacherAssignments.filter((assignment) => assignment.studentId === user.id)
    : [];
  const gradedSubjectKeys = new Set(studentGrades.map((grade) => `${grade.subject}|${grade.schoolYear || ''}|${grade.semester || ''}`));
  const assignedSubjectRows = studentAssignments
    .filter((assignment) => !gradedSubjectKeys.has(`${assignment.subject}|${assignment.schoolYear || ''}|${assignment.semester || ''}`))
    .map((assignment) => ({
      id: `assignment-${assignment.id || `${assignment.teacherId}-${assignment.subject}`}`,
      subject: assignment.subject,
      professor: users.find((currentUser) => currentUser.id === assignment.teacherId)?.name || assignment.teacherId,
      score: null,
      feedback: 'Not graded yet',
      schoolYear: assignment.schoolYear,
      semester: assignment.semester,
      isAssignedOnly: true,
    }));

  const displayGrades = [...studentGrades, ...assignedSubjectRows];

  const calculateGPA = () => {
    if (studentGrades.length === 0) return '0.0';

    const averageScore = studentGrades.reduce((total, grade) => total + (grade.score || 0), 0) / studentGrades.length;
    return (averageScore / 25).toFixed(1);
  };

  const getUniqueSubjects = () => new Set([...studentGrades.map((grade) => grade.subject), ...studentAssignments.map((assignment) => assignment.subject)]).size;

  const getLetterGrade = (score = 0) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B +';
    if (score >= 70) return 'C +';
    return 'C';
  };

  const firstName = formatName(user?.name)?.split(' ')[0] || 'Crist';

  const feedbackRows = studentGrades.filter((grade) => grade.feedback).slice(0, 3);
  const gradeHistory = Object.values(studentGrades.reduce((groups, grade) => {
    const key = `${grade.schoolYear || '2025-2026'}-${grade.semester || '1st Semester'}`;
    const group = groups[key] || { semester: `${grade.semester || '1st Semester'}, ${grade.schoolYear || '2025-2026'}`, grades: [] };
    group.grades.push(grade);
    groups[key] = group;
    return groups;
  }, {})).map((group) => {
    const average = group.grades.reduce((total, grade) => total + Number(grade.score || 0), 0) / group.grades.length;
    return { ...group, gpa: (average / 25).toFixed(2) };
  });
  const studentAttendance = attendance.filter((record) => record.studentId === user.id);
  const presentAttendance = studentAttendance.filter((record) => record.status === 'present').length;
  const absentAttendance = studentAttendance.filter((record) => record.status === 'absent').length;

  useEffect(() => {
    if (user.role !== 'admin') {
      return undefined;
    }

    let isMounted = true;

    Promise.all([
      loadAdminRequest('courses', getCourses, []),
      loadAdminRequest('teacher assignments', getTeacherAssignments, []),
      loadAdminRequest('audit logs', getAuditLogs, []),
    ])
      .then(([courseResult, assignmentResult, auditResult]) => {
        if (!isMounted) {
          return;
        }

        setAdminCourses(courseResult.data);
        setAdminAssignments(assignmentResult.data);
        setAdminAuditLogs(auditResult.data);

        const failedRequests = [courseResult, assignmentResult, auditResult].filter((result) => result.failed);

        if (failedRequests.length > 0) {
          setAdminErrorMessage(`Could not load admin ${failedRequests.map((result) => result.label).join(', ')}. Restart the server if this is a new database/schema change.`);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAdminErrorMessage('Some admin dashboard data could not be loaded.');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [user.role]);

  const handleAdminBackup = async () => {
    try {
      setIsBackingUp(true);
      setAdminStatusMessage('');
      setAdminErrorMessage('');

      const snapshot = await getBackup();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `student-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setAdminStatusMessage('Backup downloaded successfully.');
    } catch {
      setAdminErrorMessage('Backup failed. Please try again from Admin Management.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleAdminUserFormChange = (event) => {
    const { name, value } = event.target;

    setAdminUserForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setAddUserError('');
  };

  const handleAdminCourseFormChange = (event) => {
    const { name, value } = event.target;

    setAdminCourseForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setAddCourseError('');
  };

  const handleCloseAddUser = () => {
    if (isCreatingUser) {
      return;
    }

    setIsAddUserOpen(false);
    setAddUserError('');
    setAdminUserForm(emptyAdminUserForm);
  };

  const handleCloseCreateCourse = () => {
    if (isCreatingCourse) {
      return;
    }

    setIsCreateCourseOpen(false);
    setAddCourseError('');
    setAdminCourseForm(emptyAdminCourseForm);
  };

  const handleCreateAdminUser = async (event) => {
    event.preventDefault();
    const firstName = adminUserForm.firstName.trim();
    const lastName = adminUserForm.lastName.trim();

    if (!firstName || !lastName) {
      setAddUserError('Enter both first and last name.');
      return;
    }

    const rolePrefix = adminUserForm.role === 'teacher' ? 'T' : adminUserForm.role === 'admin' ? 'A' : 'S';
    const generatedId = `${rolePrefix}${Date.now().toString().slice(-6)}`;
    const emailName = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '');
    const generatedEmail = `${emailName}.${generatedId.toLowerCase()}@school.com`;
    const temporaryPassword = `${adminUserForm.role.charAt(0).toUpperCase()}${adminUserForm.role.slice(1)}@123`;

    try {
      setIsCreatingUser(true);
      setAddUserError('');
      setAdminStatusMessage('');
      setAdminErrorMessage('');

      await createUser({
        id: generatedId,
        name: `${firstName} ${lastName}`,
        email: generatedEmail,
        role: adminUserForm.role,
        password: temporaryPassword,
      });
      await reloadData();
      setAdminStatusMessage(`User created. ID: ${generatedId} | Email: ${generatedEmail} | Temporary password: ${temporaryPassword}`);
      setIsAddUserOpen(false);
      setAdminUserForm(emptyAdminUserForm);
    } catch (error) {
      setAddUserError(error instanceof Error ? error.message : 'We could not create this user.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleCreateAdminCourse = async (event) => {
    event.preventDefault();

    if (!adminCourseForm.name.trim() || !adminCourseForm.code.trim()) {
      setAddCourseError('Enter both course name and course code.');
      return;
    }

    try {
      setIsCreatingCourse(true);
      setAddCourseError('');
      setAdminStatusMessage('');
      setAdminErrorMessage('');

      const savedCourse = await createCourse(adminCourseForm);
      setAdminCourses((currentCourses) => [...currentCourses, savedCourse]);
      setAdminStatusMessage(`Course created: ${savedCourse.code} - ${savedCourse.name}`);
      setIsCreateCourseOpen(false);
      setAdminCourseForm(emptyAdminCourseForm);
    } catch (error) {
      setAddCourseError(error instanceof Error ? error.message : 'We could not create this course.');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  if (user.role === 'admin') {
    const activeStudents = users.filter((currentUser) => currentUser.role === 'student').length;
    const facultyMembers = users.filter((currentUser) => currentUser.role === 'teacher').length;
    const liveCourses = adminCourses.length || new Set(grades.map((grade) => grade.subject).filter(Boolean)).size;
    const activeClasses = adminAssignments.length;
    const statCards = [
      {
        label: 'Active Students',
        value: activeStudents,
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        label: 'Faculty Members',
        value: facultyMembers,
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M22 10 12 5 2 10l10 5 10-5Z" />
            <path d="M6 12v5c3.5 2 8.5 2 12 0v-5" />
          </svg>
        ),
      },
      {
        label: 'Live Courses',
        value: liveCourses,
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="4" y="3" width="16" height="18" rx="2" />
            <path d="M8 7h8M8 11h8M8 15h5" />
          </svg>
        ),
      },
      {
        label: 'Active Classes',
        value: activeClasses,
        icon: (
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
    ];
    const recentActivity = adminAuditLogs.slice(0, 3).map((log) => ({
      id: log.id,
      title: formatAuditAction(log.action),
      detail: `${log.tableName} record ${log.recordId}`,
      time: getRelativeTimeLabel(log.changedAt),
    }));
    const visibleActivity = recentActivity.length
      ? recentActivity
      : [{ id: 'empty', title: 'No recent activity yet', detail: 'Admin actions will appear here.', time: 'now' }];

    return (
      <div className="dashboard-container admin-dashboard">
        <div className="admin-dashboard-header">
          <h1>Welcome, Admin</h1>
        </div>

        {adminStatusMessage && <StatusMessage variant="success" className="admin-dashboard-message">{adminStatusMessage}</StatusMessage>}
        {adminErrorMessage && <StatusMessage variant="error" className="admin-dashboard-message">{adminErrorMessage}</StatusMessage>}

        <div className="admin-stats-grid">
          {statCards.map((card) => (
            <section className="admin-stat-card" key={card.label}>
              <span className="admin-stat-icon">{card.icon}</span>
              <strong>{card.value}</strong>
              <small>{card.label}</small>
            </section>
          ))}
        </div>

        <div className="admin-dashboard-grid">
          <section className="admin-activity-card">
            <div className="admin-card-header">
              <h2>Recent Activity</h2>
              <button type="button" onClick={() => navigate('/manage-users#audit-logs')}>View All</button>
            </div>

            <div className="admin-activity-list">
              {visibleActivity.map((activity) => (
                <article key={activity.id} className="admin-activity-item">
                  <span className="admin-activity-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 8v5l3 2" />
                      <circle cx="12" cy="12" r="9" />
                    </svg>
                  </span>
                  <span>
                    <strong>{activity.title}</strong>
                    <small>{activity.detail}</small>
                  </span>
                  <em>{activity.time}</em>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-actions-card">
            <h2>Quick Actions</h2>
            <button type="button" className="admin-action-primary" onClick={() => setIsAddUserOpen(true)}>+ Add User</button>
            <button type="button" onClick={() => setIsCreateCourseOpen(true)}>+ Create Course</button>
            <button type="button" className="admin-action-ghost" onClick={handleAdminBackup} disabled={isBackingUp}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              {isBackingUp ? 'Backing Up...' : 'Backup Data'}
            </button>
          </section>
        </div>

        {isAddUserOpen && (
          <div className="admin-modal-overlay" role="presentation">
            <form className="admin-add-user-modal" onSubmit={handleCreateAdminUser} role="dialog" aria-modal="true" aria-labelledby="admin-add-user-title" aria-busy={isCreatingUser}>
              <span className="admin-modal-icon" aria-hidden="true" />
              <h2 id="admin-add-user-title">Add User</h2>

              {addUserError && <StatusMessage variant="error" className="admin-modal-message">{addUserError}</StatusMessage>}

              <label>
                <span>First Name</span>
                <input name="firstName" value={adminUserForm.firstName} onChange={handleAdminUserFormChange} placeholder="e.g. Jer Erick" required />
              </label>

              <label>
                <span>Last Name</span>
                <input name="lastName" value={adminUserForm.lastName} onChange={handleAdminUserFormChange} placeholder="e.g. Dumalagan" required />
              </label>

              <label>
                <span>Role</span>
                <select name="role" value={adminUserForm.role} onChange={handleAdminUserFormChange}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </label>

              <div className="admin-modal-two-column">
                <label>
                  <span>Semester</span>
                  <select name="semester" value={adminUserForm.semester} onChange={handleAdminUserFormChange}>
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>Summer</option>
                  </select>
                </label>

                <label>
                  <span>School Year</span>
                  <input name="schoolYear" value={adminUserForm.schoolYear} onChange={handleAdminUserFormChange} placeholder="2025-2026" />
                </label>
              </div>

              <button type="submit" className="admin-modal-submit" disabled={isCreatingUser}>
                {isCreatingUser ? 'Adding User...' : 'Add New User'}
              </button>
              <button type="button" className="admin-modal-cancel" onClick={handleCloseAddUser} disabled={isCreatingUser}>
                Cancel
              </button>
            </form>
          </div>
        )}

        {isCreateCourseOpen && (
          <div className="admin-modal-overlay" role="presentation">
            <form className="admin-add-user-modal admin-course-modal" onSubmit={handleCreateAdminCourse} role="dialog" aria-modal="true" aria-labelledby="admin-create-course-title" aria-busy={isCreatingCourse}>
              <span className="admin-modal-icon" aria-hidden="true" />
              <h2 id="admin-create-course-title">Create Course</h2>

              {addCourseError && <StatusMessage variant="error" className="admin-modal-message">{addCourseError}</StatusMessage>}

              <label>
                <span>Course Name</span>
                <input name="name" value={adminCourseForm.name} onChange={handleAdminCourseFormChange} placeholder="e.g., Information Technology Fundamentals" required />
              </label>

              <label>
                <span>Course Code</span>
                <input name="code" value={adminCourseForm.code} onChange={handleAdminCourseFormChange} placeholder="e.g. IT1070" required />
              </label>

              <label>
                <span>Department</span>
                <input name="description" value={adminCourseForm.description} onChange={handleAdminCourseFormChange} placeholder="e.g., Comp. Science" />
              </label>

              <label>
                <span>Schedule</span>
                <input name="schedule" value={adminCourseForm.schedule} onChange={handleAdminCourseFormChange} placeholder="e.g., MWF 9:00 AM" />
              </label>

              <div className="admin-modal-two-column">
                <label>
                  <span>Semester</span>
                  <select name="semester" value={adminCourseForm.semester} onChange={handleAdminCourseFormChange}>
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>Summer</option>
                  </select>
                </label>

                <label>
                  <span>School Year</span>
                  <input name="schoolYear" value={adminCourseForm.schoolYear} onChange={handleAdminCourseFormChange} placeholder="2025-2026" />
                </label>
              </div>

              <button type="submit" className="admin-modal-submit" disabled={isCreatingCourse}>
                {isCreatingCourse ? 'Adding Course...' : 'Add Course'}
              </button>
              <button type="button" className="admin-modal-cancel" onClick={handleCloseCreateCourse} disabled={isCreatingCourse}>
                Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  if (user.role === 'teacher') {
    const teacherName = formatName(user?.name) || 'Prof. Reyes';
    const teacherStudents = users.filter((currentUser) => currentUser.role === 'student');
    const totalStudents = teacherStudents.length;
    const teacherAverage = Math.round(classAnalytics?.classAverage || 0);
    const topStudents = (classAnalytics?.topPerformers || []).map((item) => ({
      name: users.find((currentUser) => currentUser.id === item.studentId)?.name || item.studentId,
      note: 'Highest current averages',
      score: `${item.average}%`,
      status: 'Mastery',
    }));
    const needsImprovement = (classAnalytics?.bottomPerformers || []).map((item) => ({
      name: users.find((currentUser) => currentUser.id === item.studentId)?.name || item.studentId,
      note: 'Lowest current averages',
      score: `${item.average}%`,
      status: item.average < 75 ? 'At Risk' : 'Monitor',
    }));
    const distribution = classAnalytics?.distribution || { A: 0, B: 0, C: 0, D: 0, F: 0 };
    const maxDistribution = Math.max(...Object.values(distribution), 1);
    const gradeDistribution = Object.entries(distribution).map(([letter, count]) => ({
      letter,
      value: Math.max((count / maxDistribution) * 100, count ? 16 : 4),
      color: letter === 'F' ? '#ff1010' : letter === 'D' ? '#858585' : '#6556f4',
    }));

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
                        <span className="score-badge">
                          {grade.isAssignedOnly ? 'Not graded yet' : `${getLetterGrade(grade.score)} (${grade.score}%)`}
                        </span>
                      </td>
                      <td className="feedback-cell" data-label="Feedback">{grade.feedback || 'No feedback'}</td>
                      <td data-label="Action"><button type="button" className="view-link">View</button></td>
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
                <p className="metric-value">{studentAttendance.length}</p>
              </div>
              <div className="metric">
                <p className="metric-label present">Present</p>
                <p className="metric-value">{presentAttendance}</p>
              </div>
              <div className="metric">
                <p className="metric-label absent">Absent</p>
                <p className="metric-value">{absentAttendance}</p>
              </div>
            </div>
          </section>

          <section className="feedback-section">
            <h2>Teacher Feedback</h2>
            <div className="feedback-list">
              {feedbackRows.map((feedback) => (
                <div key={feedback.id} className="feedback-item">
                  <p className="feedback-text">"{feedback.feedback}"</p>
                  <p className="feedback-teacher">
                    <span aria-hidden="true">{feedback.subject?.[0] || 'S'}</span>
                    - {feedback.subject}
                  </p>
                </div>
              ))}
              {feedbackRows.length === 0 && <p className="empty-state">No feedback available yet</p>}
            </div>
          </section>

          <section className="card records-card">
            <h2>Academic Records</h2>
            <div className="records-actions">
              <button type="button" className="record-btn">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M9 15h6M12 12v6" />
                </svg>
                Download PDF
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </button>
              <button type="button" className="record-btn">
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
