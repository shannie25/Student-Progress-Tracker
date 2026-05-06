import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
  const { user, loading, error } = useAuth();

  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#1f2937' }}>
        Loading data from the server...
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
          element={error ? <div style={{ padding: '32px', color: '#b91c1c' }}>{error}</div> : <Navigate to="/student" />}
        />
        <Route path="*" element={<Navigate to="/student" />} />
      </Routes>
    );
  }

  return (
    <div className="app-shell">
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
