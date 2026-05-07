import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { formatName } from '../utils/formatName';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmed = window.confirm('Log out of ClassIQ? You will return to the login screen.');

    if (!confirmed) {
      return;
    }

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
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'ClassID';

  const adminNavItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/manage-users#users', label: 'Users', hash: '#users' },
    { to: '/manage-users#courses', label: 'Courses', hash: '#courses' },
    { to: '/generate-report', label: 'Reports' },
    { to: '/manage-users#grade-scale', label: 'Grade Scale', hash: '#grade-scale' },
    { to: '/manage-users#audit-logs', label: 'Audit Logs', hash: '#audit-logs' },
  ];
  const defaultNavItems = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/add-grades', label: user?.role === 'teacher' ? 'Classes' : 'Grades' },
    { to: '/students', label: 'Students', visible: user?.role === 'teacher' },
    { to: '/attendance', label: 'Attendance', visible: user?.role !== 'teacher' },
    { to: '/grades-management', label: 'Grades', visible: user?.role === 'teacher' },
    { to: '/generate-report', label: 'Reports' },
  ];
  const navItems = user?.role === 'admin' ? adminNavItems : defaultNavItems;
  const isNavItemActive = (item, isActive) => {
    if (item.hash) {
      return location.pathname === '/manage-users' && location.hash === item.hash;
    }

    return isActive;
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>ClassIQ</h1>
      </div>

      <div className="sidebar-profile">
        <div className="sidebar-avatar">{initials}</div>
        <div>
          <p className="sidebar-name">{displayName}</p>
          <p className="sidebar-id">{roleLabel}</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems
          .filter((item) => item.visible !== false)
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isNavItemActive(item, isActive) ? ' active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
      </nav>

      <button type="button" className="sidebar-logout" onClick={handleLogout} aria-label="Log out of ClassIQ">
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
