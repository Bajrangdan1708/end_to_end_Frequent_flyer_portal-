import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Member } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  member: Member | null;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  member,
  isDeleting,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !member) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onClose();
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        style={{ maxWidth: '440px' }}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <AlertTriangle size={20} color="var(--color-error)" aria-hidden="true" />
            <h2 id="delete-confirm-title" className="modal-title">
              Confirm Deletion
            </h2>
          </div>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Are you sure you want to permanently delete frequent flyer account for{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>{member.fullName}</strong> (
            <span className="mono-num">{member.membershipNumber}</span>)?
          </p>
          <div
            style={{
              padding: 'var(--space-3)',
              background: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              color: 'var(--color-error)',
            }}
          >
            This action cannot be undone. All associated transaction logs and accumulated balance ({member.accumulatedMiles.toLocaleString()} miles) will be expunged.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Member'}
          </button>
        </div>
      </div>
    </div>
  );
};
