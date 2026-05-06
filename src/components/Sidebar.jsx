import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatName } from '../utils/formatName';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';
  const displayName = formatName(user?.name) || 'Crist Bland';

  const navItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/add-grades', label: user?.role === 'teacher' ? 'Classes' : 'Grades' },
    { to: '/students', label: 'Students', visible: user?.role === 'teacher' },
    { to: '/attendance', label: 'Attendance', visible: user?.role !== 'teacher' },
    { to: '/grades-management', label: 'Grades', visible: user?.role === 'teacher' },
    { to: '/generate-report', label: 'Reports' },
    { to: '/manage-users', label: 'Manage Users', visible: user?.role === 'admin' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>ClassIQ</h1>
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">{initials}</div>
        <div>
          <p className="sidebar-name">{displayName}</p>
          <p className="sidebar-id">ClassID</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems
          .filter((item) => item.visible !== false)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
      </nav>

      <button className="sidebar-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
