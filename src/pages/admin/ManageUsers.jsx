import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { StatusMessage } from '../../components/ui';
import { formatName } from '../../utils/formatName';
import {
  createCourse,
  createGradeScale,
  createUser,
  deleteCourse,
  deleteGradeScale,
  deleteUser,
  getAuditLogs,
  getCourses,
  getGradeScales,
  getTeacherAssignments,
  resetUserPassword,
  updateCourse,
  updateGradeScale,
  updateUser,
} from '../../services/adminService';
import './ManageUsers.css';

const emptyUserForm = {
  id: '',
  firstName: '',
  lastName: '',
  name: '',
  email: '',
  role: 'student',
  status: 'Active',
  course: 'BSIT',
  department: 'Computer Studies',
  semester: '1st Semester',
  schoolYear: '2025-2026',
  password: '',
};
const emptyResetPasswordForm = { password: '', confirmPassword: '' };
const emptyCourseForm = { code: '', name: '', description: '', schedule: '', semester: '1st Semester', schoolYear: '2025-2026', teacherId: '' };
const emptyScaleForm = { label: '', minScore: 90, maxScore: 100, description: '' };
const usersPerPage = 4;
const coursesPerPage = 5;
const auditLogsPerPage = 4;

const standardScaleRows = [
  { grade: 'A', title: 'Excellent Performance', range: '90 - 100%', status: 'Primary Rank', modifier: '4.0', tone: 'blue' },
  { grade: 'B+', title: 'Very Good Performance', range: '85 - 89%', status: 'Standard', modifier: '3.5', tone: 'blue' },
  { grade: 'B', title: 'Good Performance', range: '80 - 84%', status: 'Standard', modifier: '3.0', tone: 'blue' },
  { grade: 'C+', title: 'Above Average', range: '75 - 79%', status: 'Standard', modifier: '2.5', tone: 'purple' },
  { grade: 'C', title: 'Average Performance', range: '70 - 74%', status: 'Standard', modifier: '2.0', tone: 'purple' },
  { grade: 'D', title: 'Below Average', range: '60 - 69%', status: 'Standard', modifier: '1.0', tone: 'blue' },
  { grade: 'F', title: 'Unsatisfactory', range: 'Below 60%', status: 'Failing State', modifier: '0.0', tone: 'red' },
];

const roleLabel = (role = '') => role.charAt(0).toUpperCase() + role.slice(1);

const splitName = (name = '') => {
  const parts = formatName(name).split(' ').filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
  };
};

const composeName = (form) => {
  return `${form.firstName || ''} ${form.lastName || ''}`.trim() || form.name;
};

const parseScaleRange = (range = '') => {
  const [minScore, maxScore] = range.match(/\d+/g)?.map(Number) || [0, 0];
  return { minScore, maxScore };
};

const createScaleDraftRow = (row = {}, index = 0) => {
  const rangeScores = row.range ? parseScaleRange(row.range) : {};

  return {
    clientId: row.id ? `scale-${row.id}` : `draft-${Date.now()}-${index}`,
    id: row.id,
    label: row.label || row.grade || '',
    minScore: row.minScore ?? rangeScores.minScore ?? 0,
    maxScore: row.maxScore ?? rangeScores.maxScore ?? 100,
    description: row.description || row.title || '',
  };
};

const getCourseDepartment = (course) => {
  const source = `${course.code || ''} ${course.name || ''} ${course.description || ''}`.toLowerCase();

  if (source.includes('design') || source.includes('creative') || source.includes('fine')) return 'Fine Arts';
  if (source.includes('engineer') || source.includes('fluid') || source.includes('engr')) return 'Engineering';
  if (source.includes('ethic') || source.includes('philos')) return 'Philosophy';
  if (source.includes('info') || source.includes('technology') || source.includes('stack') || source.includes('comp') || source.includes('bsit')) return 'Comp. Science';

  return 'General';
};

const IconButton = ({ label, className = '', children, onClick, disabled = false }) => (
  <button type="button" className={`users-icon-btn ${className}`.trim()} aria-label={label} title={label} onClick={onClick} disabled={disabled}>
    {children}
  </button>
);

const CourseCatalog = ({
  courses,
  teachers,
  searchQuery,
  setSearchQuery,
  departmentFilter,
  setDepartmentFilter,
  facultyFilter,
  setFacultyFilter,
  currentPage,
  setCurrentPage,
  openCreateCourse,
  onEditCourse,
  onDeleteCourse,
  successMessage,
  errorMessage,
  isSaving,
}) => {
  const teacherMap = useMemo(() => {
    return usersToMap(teachers);
  }, [teachers]);
  const courseRows = useMemo(() => {
    return courses.map((course) => ({
      ...course,
      department: getCourseDepartment(course),
      teacherName: course.teacherId ? teacherMap.get(course.teacherId) || course.teacherId : 'Unassigned',
    }));
  }, [courses, teacherMap]);
  const departments = useMemo(() => {
    return Array.from(new Set(courseRows.map((course) => course.department))).sort();
  }, [courseRows]);
  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return courseRows.filter((course) => {
      const matchesQuery = !query || [course.code, course.name, course.department, course.teacherName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(query));
      const matchesDepartment = departmentFilter === 'all' || course.department === departmentFilter;
      const matchesFaculty = facultyFilter === 'all' || course.teacherId === facultyFilter;

      return matchesQuery && matchesDepartment && matchesFaculty;
    });
  }, [courseRows, departmentFilter, facultyFilter, searchQuery]);
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / coursesPerPage));
  const pageCourses = filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);
  const activeCourses = courses.length;
  const pendingReview = courseRows.filter((course) => !course.teacherId).length;
  const pageStart = filteredCourses.length === 0 ? 0 : (currentPage - 1) * coursesPerPage + 1;
  const pageEnd = Math.min(currentPage * coursesPerPage, filteredCourses.length);

  return (
    <section id="courses" className="course-catalog-panel">
      <div className="course-catalog-header">
        <h1>Course Catalog</h1>
        <button type="button" className="course-create-btn" onClick={openCreateCourse} disabled={isSaving}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create Course
        </button>
      </div>

      {successMessage && <StatusMessage variant="success" className="users-status-message">{successMessage}</StatusMessage>}
      {errorMessage && <StatusMessage variant="error" className="users-status-message">{errorMessage}</StatusMessage>}

      <div className="course-summary-grid">
        <section className="course-summary-card primary">
          <span>Total Active Courses</span>
          <strong>{activeCourses}</strong>
          <small>{activeCourses ? 'Courses currently available' : 'Create a course to begin'}</small>
        </section>
        <section className="course-summary-card review">
          <span>Pending Review</span>
          <strong>{pendingReview}</strong>
          <small>{pendingReview ? 'Updates awaiting approval' : 'No updates awaiting approval'}</small>
        </section>
      </div>

      <div className="course-filter-bar">
        <label className="course-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m21 21-4.35-4.35" />
            <circle cx="11" cy="11" r="7" />
          </svg>
          <input
            type="search"
            placeholder="Filter by course name or code..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <select value={departmentFilter} aria-label="Filter courses by department" onChange={(event) => setDepartmentFilter(event.target.value)}>
          <option value="all">All Departments</option>
          {departments.map((department) => <option key={department} value={department}>{department}</option>)}
        </select>
        <select value={facultyFilter} aria-label="Filter courses by faculty" onChange={(event) => setFacultyFilter(event.target.value)}>
          <option value="all">All Faculty</option>
          {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{formatName(teacher.name)}</option>)}
        </select>
      </div>

      <div className="course-table-card">
        <table className="course-table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Teacher/Lead</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageCourses.map((course) => (
              <tr key={course.id || course.code}>
                <td>{course.code}</td>
                <td>{course.name}</td>
                <td className={course.teacherId ? '' : 'muted'}>{course.teacherName}</td>
                <td><span className="course-department-pill">{course.department}</span></td>
                <td>
                  <span className="users-action-cell">
                    <IconButton label={`Edit ${course.name}`} onClick={() => onEditCourse(course)} disabled={isSaving}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                      </svg>
                    </IconButton>
                    <IconButton label={`Delete ${course.name}`} className="delete" onClick={() => onDeleteCourse(course)} disabled={isSaving}>
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6l-1 15H6L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </IconButton>
                  </span>
                </td>
              </tr>
            ))}
            {pageCourses.length === 0 && (
              <tr>
                <td colSpan="5" className="users-empty">No courses match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="users-pagination">
          <span>Showing {pageStart} to {pageEnd} of {filteredCourses.length} courses</span>
          <div>
            <button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button key={page} type="button" className={page === currentPage ? 'active' : ''} onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            ))}
            <button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const usersToMap = (accounts) => {
  return new Map(accounts.map((account) => [account.id, formatName(account.name)]));
};

const loadAdminRequest = async (label, request, fallback) => {
  try {
    return { label, data: await request(), failed: false };
  } catch (error) {
    return { label, data: fallback, failed: true, message: error instanceof Error ? error.message : 'Request failed' };
  }
};

const accountDetailsToMap = (accounts) => {
  return new Map(accounts.map((account) => [account.id, account]));
};

const formatAuditAction = (action = '') => {
  return action
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const GradeScaleConfiguration = ({ gradeScales, openCreateScale, onUnavailableAction, successMessage, errorMessage, isSaving }) => {
  const scaleRows = gradeScales.length
    ? gradeScales.map((scale, index) => ({
        grade: scale.label,
        title: scale.description || standardScaleRows[index]?.title || 'Custom Scale',
        range: `${scale.minScore} - ${scale.maxScore}%`,
        status: index === 0 ? 'Primary Rank' : 'Standard',
        modifier: standardScaleRows[index]?.modifier || `${Math.max(0, 4 - index * 0.5).toFixed(1)}`,
        tone: standardScaleRows[index]?.tone || 'blue',
      }))
    : standardScaleRows;

  return (
    <section id="grade-scale" className="grade-scale-panel">
      <div className="course-catalog-header">
        <h1>Grade Scale Configuration</h1>
        <button type="button" className="course-create-btn" onClick={openCreateScale} disabled={isSaving}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
          </svg>
          Edit Grade Scale
        </button>
      </div>

      {successMessage && <StatusMessage variant="success" className="users-status-message">{successMessage}</StatusMessage>}
      {errorMessage && <StatusMessage variant="error" className="users-status-message">{errorMessage}</StatusMessage>}

      <div className="grade-scale-layout">
        <section className="grade-scale-card">
          <h2>Standard Academic Scale</h2>
          <table className="grade-scale-table">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Score Range</th>
                <th>Status</th>
                <th>Modifier</th>
              </tr>
            </thead>
            <tbody>
              {scaleRows.map((row) => (
                <tr key={`${row.grade}-${row.range}`}>
                  <td>
                    <span className="grade-scale-grade">
                      <span className={`grade-badge ${row.tone}`}>{row.grade}</span>
                      <strong>{row.title}</strong>
                    </span>
                  </td>
                  <td className={row.tone === 'red' ? 'danger' : ''}>{row.range}</td>
                  <td className={row.tone === 'red' ? 'danger' : ''}>{row.status}</td>
                  <td className={row.tone === 'red' ? 'danger modifier' : 'modifier'}>{row.modifier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <aside className="grading-side-panel">
          <section className="grading-logic-card">
            <h2>Grading Logic</h2>
            <p>The current institution policy is based on Absolute Percentage individual faculty adjustment are permitted only through formal department review and manual override at the course level.</p>
            <div className="rounding-meter">
              <span>Rounding Strategy</span>
              <strong>Half-Up</strong>
              <b />
            </div>
          </section>

          <section className="system-insight-card">
            <h2>System Insight</h2>
            <small>Academic Year 2024</small>
            <p>"The Grade Scale hasn't been updated in 238 days. Consider a review if curriculum objectives have shifted."</p>
            <button type="button" onClick={onUnavailableAction}>Run Performance Audit</button>
          </section>
        </aside>
      </div>
    </section>
  );
};

const AuditLogsView = ({
  auditLogs,
  users,
  dateRange,
  setDateRange,
  roleFilter,
  setRoleFilter,
  actionFilter,
  setActionFilter,
  currentPage,
  setCurrentPage,
}) => {
  const userMap = useMemo(() => accountDetailsToMap(users), [users]);
  const [filterTimestamp] = useState(() => Date.now());
  const actionTypes = useMemo(() => Array.from(new Set(auditLogs.map((log) => log.action))).sort(), [auditLogs]);

  const filteredLogs = useMemo(() => {
    const dayLimit = dateRange === 'all' ? null : Number(dateRange);

    return auditLogs.filter((log) => {
      const changedAt = new Date(log.changedAt).getTime();
      const account = userMap.get(log.adminId);
      const matchesDate = !dayLimit || !filterTimestamp || (!Number.isNaN(changedAt) && filterTimestamp - changedAt <= dayLimit * 24 * 60 * 60 * 1000);
      const matchesRole = roleFilter === 'all' || (account?.role || 'unknown') === roleFilter;
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;

      return matchesDate && matchesRole && matchesAction;
    });
  }, [actionFilter, auditLogs, dateRange, filterTimestamp, roleFilter, userMap]);
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / auditLogsPerPage));
  const pageLogs = filteredLogs.slice((currentPage - 1) * auditLogsPerPage, currentPage * auditLogsPerPage);
  const pageStart = filteredLogs.length === 0 ? 0 : (currentPage - 1) * auditLogsPerPage + 1;
  const pageEnd = Math.min(currentPage * auditLogsPerPage, filteredLogs.length);
  const clearFilters = () => {
    setDateRange('30');
    setRoleFilter('all');
    setActionFilter('all');
  };

  return (
    <section id="audit-logs" className="audit-logs-panel">
      <h1>Audit Logs</h1>

      <div className="audit-filter-bar">
        <label>
          <span>Date Range</span>
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
            <option value="all">All Dates</option>
          </select>
        </label>
        <label>
          <span>User Role</span>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label>
          <span>Action Type</span>
          <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
            <option value="all">All Actions</option>
            {actionTypes.map((action) => <option key={action} value={action}>{formatAuditAction(action)}</option>)}
          </select>
        </label>
        <button type="button" onClick={clearFilters}>Clear Filters</button>
      </div>

      <div className="audit-table-card">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity Affected</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pageLogs.map((log) => {
              const account = userMap.get(log.adminId);
              const changedAt = new Date(log.changedAt);
              const isFailed = String(log.action).toLowerCase().includes('fail');

              return (
                <tr key={log.id}>
                  <td>
                    <strong>{Number.isNaN(changedAt.getTime()) ? 'Unknown' : changedAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    <small>{Number.isNaN(changedAt.getTime()) ? '' : changedAt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</small>
                  </td>
                  <td>
                    <span className="audit-user-cell">
                      <span className="users-avatar">{account ? formatName(account.name).slice(0, 2).toUpperCase() : 'U'}</span>
                      <span>
                        <strong>{account ? formatName(account.name) : (log.adminId || 'System')}</strong>
                        <small>{account?.role ? roleLabel(account.role) : 'Unknown'}</small>
                      </span>
                    </span>
                  </td>
                  <td className={isFailed ? 'danger' : ''}>{formatAuditAction(log.action)}</td>
                  <td>{log.tableName}:<br />{log.recordId}</td>
                  <td><span className={`audit-status ${isFailed ? 'failed' : ''}`}>{isFailed ? 'Failed' : 'Success'}</span></td>
                </tr>
              );
            })}
            {pageLogs.length === 0 && (
              <tr><td colSpan="5" className="users-empty">No audit logs match these filters.</td></tr>
            )}
          </tbody>
        </table>

        <div className="users-pagination">
          <span>Showing {pageStart} to {pageEnd} of {filteredLogs.length} logs</span>
          <div>
            <button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button key={page} type="button" className={page === currentPage ? 'active' : ''} onClick={() => setCurrentPage(page)}>
                {page}
              </button>
            ))}
            <button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const ManageUsers = () => {
  const { users, reloadData } = useAuth();
  const location = useLocation();
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState('');
  const [editingCourseId, setEditingCourseId] = useState('');
  const [isUserFormOpen, setIsUserFormOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [resetPasswordForm, setResetPasswordForm] = useState(emptyResetPasswordForm);
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [isScaleFormOpen, setIsScaleFormOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [courseDepartmentFilter, setCourseDepartmentFilter] = useState('all');
  const [courseFacultyFilter, setCourseFacultyFilter] = useState('all');
  const [courseCurrentPage, setCourseCurrentPage] = useState(1);
  const [auditDateRange, setAuditDateRange] = useState('30');
  const [auditRoleFilter, setAuditRoleFilter] = useState('all');
  const [auditActionFilter, setAuditActionFilter] = useState('all');
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [scaleForm, setScaleForm] = useState(emptyScaleForm);
  const [scaleDraftRows, setScaleDraftRows] = useState([]);
  const [removedScaleIds, setRemovedScaleIds] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gradeScales, setGradeScales] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const teachers = users.filter((user) => user.role === 'teacher');
  const assignedTeacherIds = useMemo(() => new Set(assignments.map((assignment) => assignment.teacherId)), [assignments]);
  const filteredUsers = useMemo(() => {
    return users.filter((account) => roleFilter === 'all' || account.role === roleFilter);
  }, [roleFilter, users]);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / usersPerPage));
  const pageUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  const editingUser = editingUserId ? users.find((account) => account.id === editingUserId) : null;
  const editingUserAssignments = editingUserId ? assignments.filter((assignment) => assignment.teacherId === editingUserId || assignment.studentId === editingUserId) : [];
  const assignedSubjectNames = new Set(editingUserAssignments.map((assignment) => assignment.subject).filter(Boolean));
  const assignedCourseNames = new Set(editingUserAssignments.map((assignment) => assignment.course).filter(Boolean));
  const subjectChecklist = Array.from(new Set([...assignments.map((assignment) => assignment.subject).filter(Boolean), 'Math', 'Programming', 'English', 'Science'])).slice(0, 5);
  const courseChecklist = Array.from(new Set([...courses.map((course) => course.code).filter(Boolean), ...assignments.map((assignment) => assignment.course).filter(Boolean), 'BSIT - 1A', 'BSIT - 1B', 'BSCS - 1A'])).slice(0, 5);
  const activeAdminView = {
    '#courses': 'courses',
    '#grade-scale': 'grade-scale',
    '#audit-logs': 'audit-logs',
  }[location.hash] || 'users';

  const loadAdminData = async () => {
    const [assignmentResult, courseResult, scaleResult, auditResult] = await Promise.all([
      loadAdminRequest('teacher assignments', getTeacherAssignments, []),
      loadAdminRequest('courses', getCourses, []),
      loadAdminRequest('grade scales', getGradeScales, []),
      loadAdminRequest('audit logs', getAuditLogs, []),
    ]);

    setAssignments(assignmentResult.data);
    setCourses(courseResult.data);
    setGradeScales(scaleResult.data);
    setAuditLogs(auditResult.data);

    const failedRequests = [assignmentResult, courseResult, scaleResult, auditResult].filter((result) => result.failed);

    if (failedRequests.length > 0) {
      throw new Error(`Could not load admin ${failedRequests.map((result) => result.label).join(', ')}. Restart the server if this is a new database/schema change.`);
    }
  };

  useEffect(() => {
    loadAdminData().catch((error) => setErrorMessage(error instanceof Error ? error.message : 'Some admin data could not be loaded.'));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, users.length]);

  useEffect(() => {
    setCourseCurrentPage(1);
  }, [courseDepartmentFilter, courseFacultyFilter, courseSearchQuery, courses.length]);

  useEffect(() => {
    setAuditCurrentPage(1);
  }, [auditActionFilter, auditDateRange, auditLogs.length, auditRoleFilter]);

  useEffect(() => {
    const scrollToHash = () => {
      const sectionId = window.location.hash.replace('#', '');

      if (!sectionId) {
        return;
      }

      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    };

    scrollToHash();
    window.addEventListener('hashchange', scrollToHash);

    return () => window.removeEventListener('hashchange', scrollToHash);
  }, []);

  const runAdminAction = async (action, success) => {
    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');
      await action();
      await Promise.all([reloadData(), loadAdminData()]);
      setSuccessMessage(success);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Admin action failed.');
    } finally {
      setIsSaving(false);
    }
  };

  const openCreateUser = () => {
    setEditingUserId('');
    setUserForm(emptyUserForm);
    setIsUserFormOpen(true);
  };

  const openCreateCourse = () => {
    setEditingCourseId('');
    setCourseForm(emptyCourseForm);
    setIsCourseFormOpen(true);
  };

  const handleEditCourse = (course) => {
    setEditingCourseId(String(course.id));
    setCourseForm({
      code: course.code || '',
      name: course.name || '',
      description: course.description || '',
      schedule: course.schedule || '',
      semester: course.semester || '1st Semester',
      schoolYear: course.schoolYear || '2025-2026',
      teacherId: course.teacherId || '',
    });
    setIsCourseFormOpen(true);
  };

  const closeCourseForm = () => {
    if (isSaving) {
      return;
    }

    setEditingCourseId('');
    setCourseForm(emptyCourseForm);
    setIsCourseFormOpen(false);
  };

  const openCreateScale = () => {
    const sourceRows = gradeScales.length ? gradeScales : standardScaleRows;
    setScaleDraftRows(sourceRows.map((row, index) => createScaleDraftRow(row, index)));
    setRemovedScaleIds([]);
    setScaleForm(emptyScaleForm);
    setIsScaleFormOpen(true);
  };

  const closeScaleForm = () => {
    if (isSaving) {
      return;
    }

    setScaleForm(emptyScaleForm);
    setScaleDraftRows([]);
    setRemovedScaleIds([]);
    setIsScaleFormOpen(false);
  };

  const closeUserForm = () => {
    if (isSaving) {
      return;
    }

    setEditingUserId('');
    setUserForm(emptyUserForm);
    setIsUserFormOpen(false);
  };

  const closeResetPasswordForm = () => {
    if (isSaving) {
      return;
    }

    setResetPasswordUser(null);
    setResetPasswordForm(emptyResetPasswordForm);
    setResetPasswordError('');
  };

  const handleSubmitUser = (event) => {
    event.preventDefault();
    const userPayload = {
      ...userForm,
      name: composeName(userForm),
      email: userForm.email || `${userForm.id || userForm.firstName || 'user'}@classiq.local`.toLowerCase().replace(/\s+/g, ''),
    };

    runAdminAction(async () => {
      if (editingUserId) {
        await updateUser(editingUserId, {
          name: userPayload.name,
          email: userPayload.email,
          role: userPayload.role,
        });
      } else {
        await createUser(userPayload);
      }

      setUserForm(emptyUserForm);
      setEditingUserId('');
      setIsUserFormOpen(false);
    }, editingUserId ? 'User updated successfully.' : 'User created successfully.');
  };

  const handleEditUser = (currentUser) => {
    const nameParts = splitName(currentUser.name);
    const assignment = assignments.find((item) => item.teacherId === currentUser.id || item.studentId === currentUser.id);

    setEditingUserId(currentUser.id);
    setUserForm({
      ...emptyUserForm,
      id: currentUser.id,
      name: formatName(currentUser.name),
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      email: currentUser.email,
      role: currentUser.role,
      status: getAccountStatus(currentUser),
      course: assignment?.course || 'BSIT',
      department: getCourseDepartment({ code: assignment?.course, name: assignment?.subject, description: assignment?.course }),
      semester: assignment?.semester || '1st Semester',
      schoolYear: assignment?.schoolYear || '2025-2026',
      password: '',
    });
    setIsUserFormOpen(true);
  };

  const handleDeleteUser = (currentUser) => {
    if (!window.confirm(`Delete ${currentUser.name}? This removes linked assignments, attendance, and student grades.`)) {
      return;
    }

    runAdminAction(() => deleteUser(currentUser.id), 'User deleted successfully.');
  };

  const handleResetPassword = (currentUser) => {
    setResetPasswordUser(currentUser);
    setResetPasswordForm(emptyResetPasswordForm);
    setResetPasswordError('');
  };

  const handleSubmitResetPassword = (event) => {
    event.preventDefault();

    if (!resetPasswordUser) {
      return;
    }

    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      setResetPasswordError('Passwords do not match.');
      return;
    }

    runAdminAction(async () => {
      await resetUserPassword(resetPasswordUser.id, resetPasswordForm.password);
      setResetPasswordUser(null);
      setResetPasswordForm(emptyResetPasswordForm);
      setResetPasswordError('');
    }, 'Password reset successfully.');
  };

  const handleSubmitCourse = (event) => {
    event.preventDefault();
    runAdminAction(async () => {
      if (editingCourseId) {
        await updateCourse(Number(editingCourseId), courseForm);
      } else {
        await createCourse(courseForm);
      }

      setCourseForm(emptyCourseForm);
      setEditingCourseId('');
      setIsCourseFormOpen(false);
    }, editingCourseId ? 'Course updated successfully.' : 'Course created successfully.');
  };

  const handleDeleteCourse = (course) => {
    if (!course.id) {
      setSuccessMessage('');
      setErrorMessage('This course cannot be deleted because it has no course ID.');
      return;
    }

    if (!window.confirm(`Delete ${course.name}? This removes the course from the catalog.`)) {
      return;
    }

    runAdminAction(() => deleteCourse(course.id), 'Course deleted successfully.');
  };

  const handleScaleDraftChange = (clientId, field, value) => {
    setScaleDraftRows((currentRows) => currentRows.map((row) => (
      row.clientId === clientId ? { ...row, [field]: value } : row
    )));
  };

  const handleAddScaleRow = () => {
    setScaleDraftRows((currentRows) => [
      ...currentRows,
      createScaleDraftRow({ label: '', minScore: 0, maxScore: 0, description: '' }, currentRows.length),
    ]);
  };

  const handleRemoveScaleRow = (row) => {
    if (row.id) {
      setRemovedScaleIds((currentIds) => [...currentIds, row.id]);
    }

    setScaleDraftRows((currentRows) => currentRows.filter((currentRow) => currentRow.clientId !== row.clientId));
  };

  const handleSubmitScale = (event) => {
    event.preventDefault();
    const normalizedRows = scaleDraftRows.map((row) => ({
      ...row,
      minScore: Number(row.minScore),
      maxScore: Number(row.maxScore),
      label: String(row.label || '').trim(),
      description: String(row.description || '').trim(),
    }));

    if (normalizedRows.length === 0) {
      setErrorMessage('Add at least one grade scale row before saving.');
      return;
    }

    if (normalizedRows.some((row) => !row.label || !Number.isFinite(row.minScore) || !Number.isFinite(row.maxScore))) {
      setErrorMessage('Each row needs a grade label, minimum score, and maximum score.');
      return;
    }

    runAdminAction(async () => {
      await Promise.all(removedScaleIds.map((scaleId) => deleteGradeScale(scaleId)));
      await Promise.all(normalizedRows.map((row) => {
        const payload = {
          label: row.label,
          minScore: row.minScore,
          maxScore: row.maxScore,
          description: row.description,
        };

        return row.id ? updateGradeScale(row.id, payload) : createGradeScale(payload);
      }));
      setScaleForm(emptyScaleForm);
      setScaleDraftRows([]);
      setRemovedScaleIds([]);
      setIsScaleFormOpen(false);
    }, 'Grade scale saved.');
  };

  const handleUnavailableScaleAction = () => {
    setErrorMessage('');
    setSuccessMessage('Performance audit completed. Grade scale settings are ready for review.');
  };

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target;
    setter((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const getAccountStatus = (account) => {
    if (account.role === 'teacher' && !assignedTeacherIds.has(account.id)) {
      return 'Unassigned';
    }

    return 'Active';
  };

  const pageStart = filteredUsers.length === 0 ? 0 : (currentPage - 1) * usersPerPage + 1;
  const pageEnd = Math.min(currentPage * usersPerPage, filteredUsers.length);

  return (
    <div className="manage-users-page">
      {activeAdminView === 'courses' && (
        <CourseCatalog
          courses={courses}
          teachers={teachers}
          searchQuery={courseSearchQuery}
          setSearchQuery={setCourseSearchQuery}
          departmentFilter={courseDepartmentFilter}
          setDepartmentFilter={setCourseDepartmentFilter}
          facultyFilter={courseFacultyFilter}
          setFacultyFilter={setCourseFacultyFilter}
          currentPage={courseCurrentPage}
          setCurrentPage={setCourseCurrentPage}
          openCreateCourse={openCreateCourse}
          onEditCourse={handleEditCourse}
          onDeleteCourse={handleDeleteCourse}
          successMessage={successMessage}
          errorMessage={errorMessage}
          isSaving={isSaving}
        />
      )}

      {activeAdminView === 'grade-scale' && (
        <GradeScaleConfiguration
          gradeScales={gradeScales}
          openCreateScale={openCreateScale}
          onUnavailableAction={handleUnavailableScaleAction}
          successMessage={successMessage}
          errorMessage={errorMessage}
          isSaving={isSaving}
        />
      )}

      {activeAdminView === 'audit-logs' && (
        <AuditLogsView
          auditLogs={auditLogs}
          users={users}
          dateRange={auditDateRange}
          setDateRange={setAuditDateRange}
          roleFilter={auditRoleFilter}
          setRoleFilter={setAuditRoleFilter}
          actionFilter={auditActionFilter}
          setActionFilter={setAuditActionFilter}
          currentPage={auditCurrentPage}
          setCurrentPage={setAuditCurrentPage}
        />
      )}

      {activeAdminView === 'users' && (
        <>
      <section id="users" className="users-panel">
        <div className="users-page-header">
          <h1>Users</h1>
          <div className="users-page-actions">
            <select value={roleFilter} aria-label="Filter users by role" onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
            <button type="button" className="users-primary-btn" onClick={openCreateUser} disabled={isSaving}>+ Add User</button>
          </div>
        </div>

        {successMessage && <StatusMessage variant="success" className="users-status-message">{successMessage}</StatusMessage>}
        {errorMessage && <StatusMessage variant="error" className="users-status-message">{errorMessage}</StatusMessage>}

        <div className="users-table-card">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageUsers.map((currentUser) => {
                const status = getAccountStatus(currentUser);
                const displayName = formatName(currentUser.name);
                const initials = displayName
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr key={currentUser.id}>
                    <td>
                      <span className="users-name-cell">
                        <span className="users-avatar">{initials}</span>
                        <span>
                          <strong>{displayName}</strong>
                          <small>{currentUser.email}</small>
                        </span>
                      </span>
                    </td>
                    <td>{roleLabel(currentUser.role)}</td>
                    <td>
                      <span className={`users-status-pill ${status === 'Unassigned' ? 'unassigned' : ''}`}>{status}</span>
                    </td>
                    <td>
                      <span className="users-action-cell">
                        <IconButton label={`Edit ${displayName}`} onClick={() => handleEditUser(currentUser)} disabled={isSaving}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
                          </svg>
                        </IconButton>
                        <IconButton label={`Reset password for ${displayName}`} className="reset" onClick={() => handleResetPassword(currentUser)} disabled={isSaving}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M15 7a4 4 0 1 0-3.4 4" />
                            <path d="M12 11h9l-2 2 2 2" />
                          </svg>
                        </IconButton>
                        <IconButton label={`Delete ${displayName}`} className="delete" onClick={() => handleDeleteUser(currentUser)} disabled={isSaving}>
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 15H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                          </svg>
                        </IconButton>
                      </span>
                    </td>
                  </tr>
                );
              })}
              {pageUsers.length === 0 && (
                <tr>
                  <td colSpan="4" className="users-empty">No users match this role.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="users-pagination">
            <span>Showing {pageStart} to {pageEnd} of {filteredUsers.length} entries</span>
            <div>
              <button type="button" aria-label="Previous page" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button key={page} type="button" className={page === currentPage ? 'active' : ''} onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              ))}
              <button type="button" aria-label="Next page" onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} disabled={currentPage === totalPages}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>
        </>
      )}

      {isUserFormOpen && (
        <div className="users-modal-overlay" role="presentation">
          <form className={`users-modal user-form-modal ${editingUserId ? 'edit-user-modal' : 'add-user-modal'}`} onSubmit={handleSubmitUser} role="dialog" aria-modal="true" aria-labelledby="users-modal-title" autoComplete="off">
            <span className="users-modal-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
                {!editingUserId && <path d="M19 8v6M16 11h6" />}
              </svg>
            </span>
            <h2 id="users-modal-title">{editingUserId ? 'Edit User' : 'Add User'}</h2>
            {editingUserId && (
              <span className="users-form-avatar" aria-hidden="true">
                <span>{`${userForm.firstName?.[0] || ''}${userForm.lastName?.[0] || ''}`.toUpperCase() || 'U'}</span>
                <b />
              </span>
            )}

            {!editingUserId && (
              <label>
                <span>ID Number</span>
                <input name="id" placeholder="e.g. 2025-001" value={userForm.id} onChange={updateForm(setUserForm)} autoComplete="off" required />
              </label>
            )}

            <div className="users-form-grid">
              <label>
                <span>First Name</span>
                <input name="firstName" placeholder="e.g. Jer Erick" value={userForm.firstName} onChange={updateForm(setUserForm)} autoComplete="given-name" required />
              </label>
              <label>
                <span>Last Name</span>
                <input name="lastName" placeholder="e.g. Dumalagan" value={userForm.lastName} onChange={updateForm(setUserForm)} autoComplete="family-name" required />
              </label>
            </div>

            {!editingUserId && (
              <label>
                <span>Email</span>
                <input name="email" type="email" placeholder="e.g. user@classiq.local" value={userForm.email} onChange={updateForm(setUserForm)} autoComplete="email" required />
              </label>
            )}

            <div className="users-form-grid users-form-grid-two">
              <label>
                <span>Role</span>
                <select name="role" value={userForm.role} onChange={updateForm(setUserForm)}>
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              {editingUserId ? (
                <label>
                  <span>Status</span>
                  <select name="status" value={userForm.status} onChange={updateForm(setUserForm)}>
                    <option>Active</option>
                    <option>Unassigned</option>
                    <option>Inactive</option>
                  </select>
                </label>
              ) : (
                <label>
                  <span>Semester</span>
                  <select name="semester" value={userForm.semester} onChange={updateForm(setUserForm)}>
                    <option>1st Semester</option>
                    <option>2nd Semester</option>
                    <option>Summer</option>
                  </select>
                </label>
              )}
            </div>

            {editingUserId && userForm.role === 'student' && (
              <label>
                <span>Course</span>
                <select name="course" value={userForm.course} onChange={updateForm(setUserForm)}>
                  <option>BSIT</option>
                  <option>BSCS</option>
                  <option>BSIS</option>
                </select>
              </label>
            )}

            {editingUserId && userForm.role === 'teacher' && (
              <>
                <label>
                  <span>Department</span>
                  <select name="department" value={userForm.department} onChange={updateForm(setUserForm)}>
                    <option>Computer Studies</option>
                    <option>General Education</option>
                    <option>Engineering</option>
                  </select>
                </label>
                <div className="users-assignment-grid">
                  <section>
                    <span>Assigned Subjects</span>
                    {subjectChecklist.map((subject) => (
                      <label key={subject} className="users-check-row">
                        <b>{subject}</b>
                        <input type="checkbox" checked={assignedSubjectNames.has(subject)} readOnly />
                      </label>
                    ))}
                  </section>
                  <section>
                    <span>Assigned Courses</span>
                    {courseChecklist.map((course) => (
                      <label key={course} className="users-check-row">
                        <b>{course}</b>
                        <input type="checkbox" checked={assignedCourseNames.has(course)} readOnly />
                      </label>
                    ))}
                  </section>
                </div>
              </>
            )}

            {!editingUserId && (
              <div className="users-form-grid users-form-grid-two">
                <label>
                  <span>School Year</span>
                  <input name="schoolYear" placeholder="2025-2026" value={userForm.schoolYear} onChange={updateForm(setUserForm)} />
                </label>
                <label>
                  <span>Temporary Password</span>
                  <input name="password" type="password" placeholder="Temporary password" value={userForm.password} onChange={updateForm(setUserForm)} autoComplete="new-password" required />
                </label>
              </div>
            )}

            {editingUserId && (
              <section className="users-security-panel">
                <span className="users-security-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                    <path d="M5 11h14v10H5z" />
                  </svg>
                </span>
                <span>
                  <strong>Authentication</strong>
                  <small>Update user access credentials</small>
                </span>
                <button type="button" onClick={() => editingUser && handleResetPassword(editingUser)} disabled={isSaving || !editingUser}>
                  Reset Password
                </button>
              </section>
            )}

            <div className="users-modal-actions">
              <button type="button" className="admin-tool-secondary" onClick={closeUserForm} disabled={isSaving}>Cancel</button>
              <button type="submit" className="users-primary-btn" disabled={isSaving}>{editingUserId ? 'Save Changes' : 'Add New User'}</button>
            </div>
          </form>
        </div>
      )}

      {resetPasswordUser && (
        <div className="users-modal-overlay" role="presentation">
          <form className="users-modal reset-password-modal" onSubmit={handleSubmitResetPassword} role="dialog" aria-modal="true" aria-labelledby="reset-password-title" autoComplete="off">
            <span className="users-modal-icon reset-password-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M15 7a4 4 0 1 0-3.4 4" />
                <path d="M12 11h9l-2 2 2 2" />
              </svg>
            </span>
            <h2 id="reset-password-title">Reset Password</h2>
            <label>
              <span>User</span>
              <input value={formatName(resetPasswordUser.name)} readOnly />
            </label>
            <label>
              <span>New Password</span>
              <input name="password" type="password" placeholder="New password" value={resetPasswordForm.password} onChange={updateForm(setResetPasswordForm)} autoComplete="new-password" required />
            </label>
            <label>
              <span>Confirm Password</span>
              <input name="confirmPassword" type="password" placeholder="Confirm password" value={resetPasswordForm.confirmPassword} onChange={updateForm(setResetPasswordForm)} autoComplete="new-password" required />
            </label>
            <p className="reset-password-warning">
              <span aria-hidden="true">!</span>
              User will need to log in again after resetting.
            </p>
            {resetPasswordError && <StatusMessage variant="error" className="users-status-message">{resetPasswordError}</StatusMessage>}
            <div className="users-modal-actions reset-password-actions">
              <button type="submit" className="users-primary-btn" disabled={isSaving}>Reset Password</button>
              <button type="button" className="admin-tool-secondary" onClick={closeResetPasswordForm} disabled={isSaving}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isCourseFormOpen && (
        <div className="users-modal-overlay" role="presentation">
          <form className="users-modal course-form-modal" onSubmit={handleSubmitCourse} role="dialog" aria-modal="true" aria-labelledby="courses-modal-title">
            <span className="course-modal-icon" aria-hidden="true" />
            <h2 id="courses-modal-title">{editingCourseId ? 'Edit Course' : 'Create Course'}</h2>
            <label>
              <span>Course Name</span>
              <input name="name" placeholder="e.g., Information Technology Fundamentals" value={courseForm.name} onChange={updateForm(setCourseForm)} required />
            </label>
            <label>
              <span>Course Code</span>
              <input name="code" placeholder="e.g. IT1070" value={courseForm.code} onChange={updateForm(setCourseForm)} required />
            </label>
            <label>
              <span>Department</span>
              <input name="description" placeholder="e.g., Comp. Science" value={courseForm.description} onChange={updateForm(setCourseForm)} />
            </label>
            <label>
              <span>Schedule</span>
              <input name="schedule" placeholder="e.g., MWF 9:00 AM" value={courseForm.schedule} onChange={updateForm(setCourseForm)} />
            </label>
            <div className="course-modal-two-column">
              <label>
                <span>Semester</span>
                <select name="semester" value={courseForm.semester} onChange={updateForm(setCourseForm)}>
                  <option>1st Semester</option>
                  <option>2nd Semester</option>
                  <option>Summer</option>
                </select>
              </label>
              <label>
                <span>School Year</span>
                <input name="schoolYear" placeholder="2025-2026" value={courseForm.schoolYear} onChange={updateForm(setCourseForm)} />
              </label>
            </div>
            <label>
              <span>Teacher Lead</span>
              <select name="teacherId" value={courseForm.teacherId} onChange={updateForm(setCourseForm)}>
                <option value="">Unassigned</option>
                {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{formatName(teacher.name)}</option>)}
              </select>
            </label>
            <div className="users-modal-actions">
              <button type="button" className="admin-tool-secondary" onClick={closeCourseForm} disabled={isSaving}>Cancel</button>
              <button type="submit" className="users-primary-btn" disabled={isSaving}>{editingCourseId ? 'Save Course' : 'Create Course'}</button>
            </div>
          </form>
        </div>
      )}

      {isScaleFormOpen && (
        <div className="users-modal-overlay" role="presentation">
          <form className="users-modal grade-scale-editor-modal" onSubmit={handleSubmitScale} role="dialog" aria-modal="true" aria-labelledby="scale-modal-title">
            <header className="grade-scale-editor-header">
              <h2 id="scale-modal-title">Edit Grade Scale</h2>
              <p>Establish grading criteria for the current academic term. Changes will reflect across reports and gradebooks.</p>
            </header>

            <div className="grade-scale-editor-table">
              <div className="grade-scale-editor-head">
                <span>Range (%)</span>
                <span>Grade</span>
                <span>Description</span>
                <span>Action</span>
              </div>
              {scaleDraftRows.map((row) => (
                <div className="grade-scale-editor-row" key={row.clientId}>
                  <div className="scale-range-inputs">
                    <input
                      aria-label="Minimum score"
                      type="number"
                      min="0"
                      max="100"
                      value={row.minScore}
                      onChange={(event) => handleScaleDraftChange(row.clientId, 'minScore', event.target.value)}
                      required
                    />
                    <span>-</span>
                    <input
                      aria-label="Maximum score"
                      type="number"
                      min="0"
                      max="100"
                      value={row.maxScore}
                      onChange={(event) => handleScaleDraftChange(row.clientId, 'maxScore', event.target.value)}
                      required
                    />
                  </div>
                  <input
                    aria-label="Grade label"
                    value={row.label}
                    onChange={(event) => handleScaleDraftChange(row.clientId, 'label', event.target.value)}
                    required
                  />
                  <input
                    aria-label="Description"
                    value={row.description}
                    onChange={(event) => handleScaleDraftChange(row.clientId, 'description', event.target.value)}
                    placeholder="Performance label"
                  />
                  <button type="button" aria-label={`Remove ${row.label || 'grade scale'} row`} onClick={() => handleRemoveScaleRow(row)} disabled={isSaving || scaleDraftRows.length === 1}>Remove</button>
                </div>
              ))}
            </div>

            <button type="button" className="grade-scale-add-row" onClick={handleAddScaleRow} disabled={isSaving}>
              <span aria-hidden="true">+</span>
              Add Row
            </button>

            <div className="users-modal-actions grade-scale-editor-actions">
              <button type="button" className="admin-tool-secondary" onClick={closeScaleForm} disabled={isSaving}>Cancel</button>
              <button type="submit" className="users-primary-btn" disabled={isSaving}>Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
