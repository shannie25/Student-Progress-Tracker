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
        <h2 style={styles.logo}>Tracker Pro</h2>
        <p style={styles.roleText}>Role: {user?.role}</p>
      </div>
      
      <nav style={styles.nav}>
        <Link to="/dashboard" style={styles.link}>Dashboard</Link>
        
        {/* ADD THIS LINE BELOW */}
        <Link to="/generate-report" style={styles.link}>Generate Report</Link>

        {user?.role === 'admin' && (
          <Link to="/manage-users" style={styles.link}>Manage Users</Link>
        )}
        
        {user?.role !== 'student' && (
          <Link to="/add-grades" style={styles.link}>Add/Update Grades</Link>
        )}
      </nav>

      <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
    </div>
  );
};

const styles = {
  sidebar: { width: '260px', backgroundColor: '', color: 'white', display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', boxSizing: 'border-box', overflow: 'hidden' },
  header: { borderBottom: '1px solid #334155', marginBottom: '20px', paddingBottom: '10px', textAlign: 'center', flexShrink: 0 },
  logo: { fontSize: '24px', margin: 0 },
  roleText: { fontSize: '12px', color: '#94a3b8', textTransform: 'capitalize' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflow: 'auto' },
  link: { color: 'white', textDecoration: 'none', padding: '12px', borderRadius: '8px', transition: '0.2s', textAlign: 'center' },
  logoutBtn: { backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, marginTop: 'auto' }
};

export default Sidebar;