import type { ReactNode } from 'react';

type CenteredStatusCardVariant = 'success' | 'error' | 'info';

type CenteredStatusCardProps = {
  message?: ReactNode;
  title?: string;
  variant?: CenteredStatusCardVariant;
  onDismiss?: () => void;
};

const CenteredStatusCard = ({ message, title, variant = 'info', onDismiss }: CenteredStatusCardProps) => {
  if (!message) {
    return null;
  }

  const role = variant === 'error' ? 'alert' : 'status';
  const fallbackTitle = variant === 'success' ? 'Success' : variant === 'error' ? 'Action Needed' : 'Notice';

  return (
    <div className="centered-status-overlay" role="presentation">
      <section className={`centered-status-card centered-status-card-${variant}`} role={role} aria-live="assertive">
        {variant !== 'success' && (
          <span className="centered-status-icon" aria-hidden="true">
            {variant === 'error' ? '!' : 'i'}
          </span>
        )}
        <h2>{title || fallbackTitle}</h2>
        <p>{message}</p>
        {onDismiss && (
          <button type="button" onClick={onDismiss}>
            OK
          </button>
        )}
      </section>
    </div>
  );
};

export default CenteredStatusCard;
