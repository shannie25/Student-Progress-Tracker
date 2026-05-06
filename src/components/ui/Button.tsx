import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button = ({ children, variant = 'primary', type = 'button', className = '', ...buttonProps }: ButtonProps) => {
  return (
    <button
      type={type}
      className={`ui-button ui-button-${variant} ${className}`.trim()}
      {...buttonProps}
    >
      {children}
    </button>
  );
};

export default Button;
