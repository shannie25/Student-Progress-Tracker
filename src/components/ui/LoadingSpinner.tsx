type LoadingSpinnerProps = {
  label?: string;
  size?: 'small' | 'medium';
};

const LoadingSpinner = ({ label = 'Loading', size = 'medium' }: LoadingSpinnerProps) => {
  return (
    <span className={`loading-spinner loading-spinner-${size}`} role="status" aria-label={label}>
      <span aria-hidden="true" />
    </span>
  );
};

export default LoadingSpinner;
