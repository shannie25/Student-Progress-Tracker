import type { ElementType, ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
};

const Card = ({ children, as: Component = 'section', className = '' }: CardProps) => {
  return (
    <Component className={`ui-card ${className}`.trim()}>
      {children}
    </Component>
  );
};

export default Card;
