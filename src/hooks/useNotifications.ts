import { useContext, useEffect, useRef } from 'react';
import { NotificationContext, type NotificationVariant } from '../context/NotificationProvider';

export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return context;
};

export const useStatusToast = (message: string, variant: NotificationVariant, title?: string) => {
  const previousMessageRef = useRef('');
  const { notify } = useNotifications();

  useEffect(() => {
    if (!message) {
      previousMessageRef.current = '';
      return;
    }

    if (previousMessageRef.current === message) {
      return;
    }

    notify({ message, variant, title });
    previousMessageRef.current = message;
  }, [message, notify, title, variant]);
};
