import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
          aria-live="polite"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={16} aria-hidden="true" color="var(--color-success)" />
          ) : (
            <AlertCircle size={16} aria-hidden="true" color="var(--color-error)" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            className="btn-icon"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
            style={{ marginLeft: 'auto', padding: '2px' }}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
};
