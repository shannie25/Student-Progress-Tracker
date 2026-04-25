import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.logo}>ClassiQ</h2>
        <p style={styles.userText}>{user?.name || 'John Doe'}</p>
        <p style={styles.studentID}>{user?.studentID || 'ID: 3001'}</p>
      </div>
      
      <nav style={styles.nav}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        <Link to="/subjects" style={styles.link}>Subjects</Link>
        <Link to="/grades" style={styles.link}>Grades</Link>
        <Link to="/attendance" style={styles.link}>Attendance</Link>
        <Link to="/reports" style={styles.link}>Reports</Link>

        {user?.role === 'admin' && (
          <Link to="/manage-users" style={styles.link}>Manage Users</Link>
        )}
      </nav>

      <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
    </div>
  );
};

const styles = {
  sidebar: { width: '260px', backgroundColor: '#2952e6', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', boxSizing: 'border-box', overflow: 'hidden' },
  header: { borderBottom: '1px solid rgba(255, 255, 255, 0.2)', marginBottom: '20px', paddingBottom: '15px', textAlign: 'center', flexShrink: 0 },
  logo: { fontSize: '24px', margin: '0 0 8px 0', fontWeight: 'bold', letterSpacing: '0.5px' },
  userText: { fontSize: '12px', color: '#e0e7ff', textTransform: 'capitalize', margin: 0 },
  studentID: { fontSize: '11px', color: '#c7d2fe', margin: 0 },
  nav: { display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflow: 'auto' },
  link: { color: 'white', textDecoration: 'none', padding: '12px 16px', borderRadius: '8px', transition: '0.2s', textAlign: 'center', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'block', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' } },
  logoutBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, marginTop: 'auto' }
};

export default Sidebar;