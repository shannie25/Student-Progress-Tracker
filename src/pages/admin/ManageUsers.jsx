import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { StatusMessage } from '../../components/ui';
import {
  createCourse,
  createGradeScale,
  createSubject,
  createTeacherAssignment,
  createUser,
  deleteTeacherAssignment,
  deleteUser,
  getAuditLogs,
  getBackup,
  getCourses,
  getGradeScales,
  getSubjects,
  getTeacherAssignments,
  resetUserPassword,
  restoreBackup,
  updateUser,
} from '../../services/adminService';

const emptyUserForm = { id: '', name: '', email: '', role: 'student', password: '' };
const emptyAssignmentForm = { teacherId: '', studentId: '', subject: '', course: '', section: '', schoolYear: '2025-2026', semester: '1st Semester' };
const emptyCourseForm = { code: '', name: '', description: '', teacherId: '' };
const emptySubjectForm = { name: '', teacherId: '' };
const emptyScaleForm = { label: '', minScore: 90, maxScore: 100, description: '' };

const ManageUsers = () => {
  const { users, reloadData } = useAuth();
  const restoreInputRef = useRef(null);
  const [userForm, setUserForm] = useState(emptyUserForm);
  const [editingUserId, setEditingUserId] = useState('');
  const [assignmentForm, setAssignmentForm] = useState(emptyAssignmentForm);
  const [courseForm, setCourseForm] = useState(emptyCourseForm);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [scaleForm, setScaleForm] = useState(emptyScaleForm);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [gradeScales, setGradeScales] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const teachers = users.filter((user) => user.role === 'teacher');
  const students = users.filter((user) => user.role === 'student');

  const loadAdminData = async () => {
    const [assignmentData, courseData, subjectData, scaleData, auditData] = await Promise.all([
      getTeacherAssignments(),
      getCourses(),
      getSubjects(),
      getGradeScales(),
      getAuditLogs(),
    ]);

    setAssignments(assignmentData);
    setCourses(courseData);
    setSubjects(subjectData);
    setGradeScales(scaleData);
    setAuditLogs(auditData);
  };

  useEffect(() => {
    loadAdminData().catch(() => setErrorMessage('Some admin data could not be loaded.'));
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

  const handleSubmitUser = (event) => {
    event.preventDefault();

    runAdminAction(async () => {
      if (editingUserId) {
        await updateUser(editingUserId, {
          name: userForm.name,
          email: userForm.email,
          role: userForm.role,
        });
      } else {
        await createUser(userForm);
      }

      setUserForm(emptyUserForm);
      setEditingUserId('');
    }, editingUserId ? 'User updated successfully.' : 'User created successfully.');
  };

  const handleEditUser = (currentUser) => {
    setEditingUserId(currentUser.id);
    setUserForm({ id: currentUser.id, name: currentUser.name, email: currentUser.email, role: currentUser.role, password: '' });
  };

  const handleDeleteUser = (currentUser) => {
    if (!window.confirm(`Delete ${currentUser.name}? This removes linked assignments, attendance, and student grades.`)) {
      return;
    }

    runAdminAction(() => deleteUser(currentUser.id), 'User deleted successfully.');
  };

  const handleResetPassword = (currentUser) => {
    const password = window.prompt(`Enter a new password for ${currentUser.name}.`);

    if (!password) {
      return;
    }

    runAdminAction(() => resetUserPassword(currentUser.id, password), 'Password reset successfully.');
  };

  const handleSubmitAssignment = (event) => {
    event.preventDefault();
    runAdminAction(async () => {
      await createTeacherAssignment(assignmentForm);
      setAssignmentForm(emptyAssignmentForm);
    }, 'Teacher assignment saved.');
  };

  const handleDeleteAssignment = (assignment) => {
    runAdminAction(() => deleteTeacherAssignment(assignment.id), 'Teacher assignment removed.');
  };

  const handleSubmitCourse = (event) => {
    event.preventDefault();
    runAdminAction(async () => {
      await createCourse(courseForm);
      setCourseForm(emptyCourseForm);
    }, 'Course created successfully.');
  };

  const handleSubmitSubject = (event) => {
    event.preventDefault();
    runAdminAction(async () => {
      await createSubject(subjectForm);
      setSubjectForm(emptySubjectForm);
    }, 'Subject created successfully.');
  };

  const handleSubmitScale = (event) => {
    event.preventDefault();
    runAdminAction(async () => {
      await createGradeScale({ ...scaleForm, minScore: Number(scaleForm.minScore), maxScore: Number(scaleForm.maxScore) });
      setScaleForm(emptyScaleForm);
    }, 'Grade scale saved.');
  };

  const handleBackup = async () => {
    await runAdminAction(async () => {
      const snapshot = await getBackup();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `student-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'Backup downloaded successfully.');
  };

  const handleRestoreFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const snapshot = JSON.parse(await file.text());
      await runAdminAction(() => restoreBackup(snapshot), 'Backup restored successfully.');
    } catch {
      setErrorMessage('The selected backup file is not valid JSON.');
    } finally {
      event.target.value = '';
    }
  };

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target;
    setter((currentForm) => ({ ...currentForm, [name]: value }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Admin Management</h2>
          <p style={styles.subtitle}>Accounts, assignments, courses, reports, and system controls</p>
        </div>
        <div style={styles.headerActions}>
          <button type="button" style={styles.primaryBtn} onClick={handleBackup} disabled={isSaving}>Backup Data</button>
          <button type="button" style={styles.secondaryBtn} onClick={() => restoreInputRef.current?.click()} disabled={isSaving}>Restore Data</button>
          <input ref={restoreInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleRestoreFile} />
        </div>
      </div>

      {successMessage && <StatusMessage variant="success">{successMessage}</StatusMessage>}
      {errorMessage && <StatusMessage variant="error">{errorMessage}</StatusMessage>}

      <section style={styles.panel}>
        <h3 style={styles.panelTitle}>{editingUserId ? 'Edit User' : 'Create User'}</h3>
        <form style={styles.formGrid} onSubmit={handleSubmitUser}>
          <input name="id" placeholder="ID number" value={userForm.id} onChange={updateForm(setUserForm)} disabled={Boolean(editingUserId)} required />
          <input name="name" placeholder="Full name" value={userForm.name} onChange={updateForm(setUserForm)} required />
          <input name="email" type="email" placeholder="Email" value={userForm.email} onChange={updateForm(setUserForm)} required />
          <select name="role" value={userForm.role} onChange={updateForm(setUserForm)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          {!editingUserId && <input name="password" type="password" placeholder="Temporary password" value={userForm.password} onChange={updateForm(setUserForm)} required />}
          <button type="submit" style={styles.primaryBtn} disabled={isSaving}>{editingUserId ? 'Save User' : 'Create User'}</button>
          {editingUserId && <button type="button" style={styles.secondaryBtn} onClick={() => { setEditingUserId(''); setUserForm(emptyUserForm); }}>Cancel</button>}
        </form>
      </section>

      <section style={styles.panel}>
        <h3 style={styles.panelTitle}>Registered Accounts</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((currentUser) => (
                <tr key={currentUser.id} style={styles.row}>
                  <td style={styles.td}>{currentUser.id}</td>
                  <td style={styles.td}>{currentUser.name}</td>
                  <td style={styles.td}>{currentUser.email}</td>
                  <td style={styles.td}>{currentUser.role}</td>
                  <td style={styles.td}>
                    <button type="button" style={styles.smallBtn} onClick={() => handleEditUser(currentUser)}>Edit</button>
                    <button type="button" style={styles.smallBtn} onClick={() => handleResetPassword(currentUser)}>Reset Password</button>
                    <button type="button" style={styles.dangerBtn} onClick={() => handleDeleteUser(currentUser)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.panel}>
        <h3 style={styles.panelTitle}>Assign Teachers to Students</h3>
        <form style={styles.formGrid} onSubmit={handleSubmitAssignment}>
          <select name="teacherId" value={assignmentForm.teacherId} onChange={updateForm(setAssignmentForm)} required>
            <option value="">Teacher</option>
            {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
          </select>
          <select name="studentId" value={assignmentForm.studentId} onChange={updateForm(setAssignmentForm)} required>
            <option value="">Student</option>
            {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
          </select>
          <input name="subject" placeholder="Subject" value={assignmentForm.subject} onChange={updateForm(setAssignmentForm)} required />
          <input name="course" placeholder="Course" value={assignmentForm.course} onChange={updateForm(setAssignmentForm)} />
          <input name="section" placeholder="Section" value={assignmentForm.section} onChange={updateForm(setAssignmentForm)} />
          <input name="schoolYear" placeholder="School year" value={assignmentForm.schoolYear} onChange={updateForm(setAssignmentForm)} />
          <select name="semester" value={assignmentForm.semester} onChange={updateForm(setAssignmentForm)}>
            <option>1st Semester</option>
            <option>2nd Semester</option>
            <option>Summer</option>
          </select>
          <button type="submit" style={styles.primaryBtn} disabled={isSaving}>Save Assignment</button>
        </form>
        <div style={styles.chipGrid}>
          {assignments.map((assignment) => (
            <span key={assignment.id} style={styles.chip}>
              {assignment.teacherId} {'->'} {assignment.studentId} / {assignment.subject}
              <button type="button" onClick={() => handleDeleteAssignment(assignment)}>x</button>
            </span>
          ))}
        </div>
      </section>

      <div style={styles.twoColumn}>
        <section style={styles.panel}>
          <h3 style={styles.panelTitle}>Courses</h3>
          <form style={styles.stackForm} onSubmit={handleSubmitCourse}>
            <input name="code" placeholder="Code" value={courseForm.code} onChange={updateForm(setCourseForm)} required />
            <input name="name" placeholder="Course name" value={courseForm.name} onChange={updateForm(setCourseForm)} required />
            <input name="description" placeholder="Description" value={courseForm.description} onChange={updateForm(setCourseForm)} />
            <select name="teacherId" value={courseForm.teacherId} onChange={updateForm(setCourseForm)}>
              <option value="">Teacher</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
            <button type="submit" style={styles.primaryBtn}>Create Course</button>
          </form>
          <ul style={styles.list}>{courses.map((course) => <li key={course.id}>{course.code} - {course.name}</li>)}</ul>
        </section>

        <section style={styles.panel}>
          <h3 style={styles.panelTitle}>Subjects</h3>
          <form style={styles.stackForm} onSubmit={handleSubmitSubject}>
            <input name="name" placeholder="Subject name" value={subjectForm.name} onChange={updateForm(setSubjectForm)} required />
            <select name="teacherId" value={subjectForm.teacherId} onChange={updateForm(setSubjectForm)} required>
              <option value="">Teacher</option>
              {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
            </select>
            <button type="submit" style={styles.primaryBtn}>Create Subject</button>
          </form>
          <ul style={styles.list}>{subjects.map((subject) => <li key={subject.id}>{subject.name} - {subject.teacherId}</li>)}</ul>
        </section>
      </div>

      <section style={styles.panel}>
        <h3 style={styles.panelTitle}>Grade Scales and Rubrics</h3>
        <form style={styles.formGrid} onSubmit={handleSubmitScale}>
          <input name="label" placeholder="Label" value={scaleForm.label} onChange={updateForm(setScaleForm)} required />
          <input name="minScore" type="number" placeholder="Min" value={scaleForm.minScore} onChange={updateForm(setScaleForm)} required />
          <input name="maxScore" type="number" placeholder="Max" value={scaleForm.maxScore} onChange={updateForm(setScaleForm)} required />
          <input name="description" placeholder="Rubric description" value={scaleForm.description} onChange={updateForm(setScaleForm)} />
          <button type="submit" style={styles.primaryBtn}>Save Scale</button>
        </form>
        <div style={styles.chipGrid}>
          {gradeScales.map((scale) => (
            <span key={scale.id} style={styles.chip}>{scale.label}: {scale.minScore}-{scale.maxScore}</span>
          ))}
        </div>
      </section>

      <section style={styles.panel}>
        <h3 style={styles.panelTitle}>Audit Logs</h3>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>When</th>
                <th style={styles.th}>Admin</th>
                <th style={styles.th}>Action</th>
                <th style={styles.th}>Table</th>
                <th style={styles.th}>Record</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} style={styles.row}>
                  <td style={styles.td}>{new Date(log.changedAt).toLocaleString()}</td>
                  <td style={styles.td}>{log.adminId || 'system'}</td>
                  <td style={styles.td}>{log.action}</td>
                  <td style={styles.td}>{log.tableName}</td>
                  <td style={styles.td}>{log.recordId}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr><td style={styles.td} colSpan="5">No audit logs yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const styles = {
  page: { padding: '20px', textAlign: 'left', overflowY: 'auto', color: '#1f2937' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' },
  headerActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  title: { color: '#1e40af', margin: 0 },
  subtitle: { color: '#475569', marginTop: '8px' },
  panel: { background: '#ffffff', border: '1px solid #d8dee9', borderRadius: '8px', padding: '16px', marginBottom: '16px' },
  panelTitle: { margin: '0 0 14px', color: '#111827' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', alignItems: 'center' },
  stackForm: { display: 'grid', gap: '10px' },
  twoColumn: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  tableWrapper: { width: '100%', overflowX: 'auto' },
  table: { width: '100%', minWidth: '760px', borderCollapse: 'collapse', background: 'white' },
  row: { borderBottom: '1px solid #e5e7eb' },
  th: { padding: '12px', borderBottom: '2px solid #ddd', color: '#1e293b', textAlign: 'left' },
  td: { padding: '12px', color: '#1f2937', verticalAlign: 'middle' },
  primaryBtn: { padding: '10px 14px', cursor: 'pointer', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800 },
  secondaryBtn: { padding: '10px 14px', cursor: 'pointer', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '8px', fontWeight: 800 },
  smallBtn: { marginRight: '8px', padding: '6px 10px', cursor: 'pointer', background: '#e5e7eb', color: '#111827', border: 'none', borderRadius: '4px' },
  dangerBtn: { padding: '6px 10px', cursor: 'pointer', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px' },
  chipGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' },
  chip: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '999px', background: '#eef2ff', color: '#1e3a8a', fontWeight: 700 },
  list: { margin: '12px 0 0', paddingLeft: '18px' },
};

export default ManageUsers;
