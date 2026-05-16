import { formatName } from './formatName';

export const getInitials = (name = '', fallback = 'U') => {
  const initials = formatName(name)
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return initials || fallback;
};
