import type { ReactNode } from 'react';

type StatusMessageVariant = 'success' | 'error' | 'info';

type StatusMessageProps = {
  children: ReactNode;
  variant?: StatusMessageVariant;
  className?: string;
};

const StatusMessage = ({ children, variant = 'info', className = '' }: StatusMessageProps) => {
  const role = variant === 'error' ? 'alert' : 'status';

  return (
    <div className={`status-message status-message-${variant} ${className}`.trim()} role={role} aria-live="polite">
      {children}
    </div>
  );
};

export default StatusMessage;
