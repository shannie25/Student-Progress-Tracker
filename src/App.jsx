import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { LoadingSpinner, StatusMessage } from './components/ui';
import './App.css';

import Dashboard from './pages/Dashboard';
import StudentGrades from './pages/StudentGrades';
import AddGrades from './pages/admin/AddGrades';
import ManageUsers from './pages/admin/ManageUsers';
import GenerateReport from './pages/shared/GenerateReport';
import Attendance from './pages/Attendance';
import TeacherStudents from './pages/TeacherStudents';
import TeacherStudentProfile from './pages/TeacherStudentProfile';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import TeacherLogin from './pages/TeacherLogin';
import RegisterForm from './components/RegisterForm';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

const AppRoutes = () => {
  const { user, loading, error, reloadData } = useAuth();

  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="app-loading" role="status" aria-live="polite">
        <LoadingSpinner label="Loading account data" />
        <span>Loading your account data...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/teacher" element={<TeacherLogin />} />
        <Route
          path="/register"
          element={<RegisterForm onBackToLogin={(role = 'student') => navigate(role === 'teacher' ? '/teacher' : '/student')} />}
        />
        <Route
          path="/"
          element={error ? (
            <div className="app-error-state">
              <StatusMessage variant="error">
                We could not load your account data. Please check that the server is running, then try again.
              </StatusMessage>
              <button type="button" className="login-btn" onClick={reloadData}>
                Retry
              </button>
            </div>
          ) : <Navigate to="/student" />}
        />
        <Route path="*" element={<Navigate to="/student" />} />
      </Routes>
    );
  }

  return (
    <div className={`app-shell app-shell-${user.role}`}>
      <Sidebar />
      <main className="app-main">
        <Topbar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-grades" element={user?.role === 'student' ? <StudentGrades /> : <AddGrades />} />
          <Route path="/students" element={user?.role === 'teacher' ? <TeacherStudents /> : <Navigate to="/dashboard" />} />
          <Route path="/students/:studentId" element={user?.role === 'teacher' ? <TeacherStudentProfile /> : <Navigate to="/dashboard" />} />
          <Route path="/grades-management" element={user?.role === 'teacher' ? <AddGrades /> : <Navigate to="/dashboard" />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/manage-users" element={user?.role === 'admin' ? <ManageUsers /> : <Navigate to="/dashboard" />} />
          <Route path="/generate-report" element={<GenerateReport />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
