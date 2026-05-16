import React from 'react';
import { formatName } from '../utils/formatName';
import { getInitials } from '../utils/avatar';

const UserAvatar = ({ user, name, src, className = '', fallback = 'U', alt }) => {
  const displayName = formatName(name || user?.name) || fallback;
  const imageSrc = src || user?.profilePicture;

  return (
    <span className={`user-avatar ${className}`.trim()} aria-label={displayName}>
      {imageSrc ? (
        <img src={imageSrc} alt={alt || `${displayName} profile`} />
      ) : (
        getInitials(displayName, fallback)
      )}
    </span>
  );
};

export default UserAvatar;
