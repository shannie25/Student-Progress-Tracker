import type { ReactNode } from 'react';

type ModalProps = {
  children: ReactNode;
  title: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
};

const Modal = ({ children, title, isOpen, onClose, className = '' }: ModalProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="ui-modal-overlay" role="presentation">
      <section className={`ui-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title}>
        <header className="ui-modal-header">
          <h2>{title}</h2>
          <button type="button" onClick={onClose} aria-label={`Close ${title}`}>
            x
          </button>
        </header>
        {children}
      </section>
    </div>
  );
};

export default Modal;
