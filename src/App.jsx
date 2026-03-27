import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import Header from './components/Header';
import Layout from './components/Layout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

import Dashboard from './pages/Dashboard';
import AddGrades from './pages/admin/AddGrades';
import ManageUsers from './pages/admin/ManageUsers';
import GenerateReport from './pages/shared/GenerateReport';
import Sidebar from './components/Sidebar';
import studentIcons from './assets/icon.png';

const AppRoutes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Show login/register pages if not authenticated
  if (!user) {
    return (
      <Routes>
        <Route path="/" element={
          <>
            <Header title="Student's Performance Tracker" />
            <Layout leftImage={studentIcons} showImage={true}>
              <LoginForm onRegister={() => navigate('/register')} />
            </Layout>
          </>
        } />
        <Route path="/register" element={
          <>
            <Header title="Register to ClassIQ" />
            <Layout showImage={false}>
              <RegisterForm onBackToLogin={() => navigate('/')} />
            </Layout>
          </>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  // Show dashboard and admin pages if authenticated
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, backgroundColor: '#f0f2f5' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-grades" element={user?.role !== 'student' ? <AddGrades /> : <Navigate to="/dashboard" />} />
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