import React, { useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserAvatar from './UserAvatar';
import { getInitials } from '../utils/avatar';
import { formatName } from '../utils/formatName';
import { resizeProfileImage } from '../utils/profilePhoto';

const Sidebar = () => {
  const { user, logout, updateProfilePicture } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const handleLogout = () => {
    const confirmed = window.confirm('Log out of ClassIQ? You will return to the login screen.');

    if (!confirmed) {
      return;
    }

    logout();
    navigate('/');
  };

  const initials = getInitials(user?.name, 'U');
  const displayName = formatName(user?.name) || 'Crist Bland';
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'ClassID';
  const canUploadProfilePicture = ['teacher', 'student'].includes(user?.role);
  const sidebarNameSize = displayName.length > 24
    ? '10px'
    : displayName.length > 18
      ? '11px'
      : displayName.length > 14
        ? '12px'
        : '14px';

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !user || !canUploadProfilePicture) {
      return;
    }

    try {
      setIsUploadingPhoto(true);
      setPhotoError('');
      const profilePicture = await resizeProfileImage(file);
      await updateProfilePicture(profilePicture);
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Profile picture could not be saved.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
        {canUploadProfilePicture ? (
          <label className={`sidebar-avatar-upload${isUploadingPhoto ? ' uploading' : ''}`} title="Upload profile picture">
            <UserAvatar user={user} className="sidebar-avatar" fallback={initials} />
            <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfilePictureChange} disabled={isUploadingPhoto} />
            <span className="sidebar-avatar-edit-label">{isUploadingPhoto ? '...' : 'Change'}</span>
          </label>
        ) : (
          <UserAvatar user={user} className="sidebar-avatar" fallback={initials} />
        )}
        <div className="sidebar-profile-info">
          <p className="sidebar-name" style={{ '--sidebar-name-size': sidebarNameSize }}>{displayName}</p>
          <p className="sidebar-id">{roleLabel}</p>
        </div>
      </div>
      {photoError && <p className="sidebar-upload-error">{photoError}</p>}

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
