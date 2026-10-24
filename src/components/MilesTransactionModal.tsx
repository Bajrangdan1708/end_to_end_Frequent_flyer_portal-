import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Member, TransactionType } from '../types';
import { validateTransaction } from '../utils/validation';

interface MilesTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSubmit: (params: {
    memberId: string;
    type: TransactionType;
    amount: number;
    description: string;
  }) => Promise<void>;
}

export const MilesTransactionModal: React.FC<MilesTransactionModalProps> = ({
  isOpen,
  onClose,
  member,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('Earn');
  const [amount, setAmount] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setType('Earn');
      setAmount('');
      setDescription('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const numAmount = Number(amount);
    const validation = validateTransaction(type, numAmount, member.accumulatedMiles, description);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid transaction');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        memberId: member.id,
        type,
        amount: numAmount,
        description,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="miles-modal-title"
      >
        <div className="modal-header">
          <div>
            <h2 id="miles-modal-title" className="modal-title">
              Manage Miles — {member.fullName}
            </h2>
            <div className="mono-num" style={{ fontSize: '0.8125rem' }}>
              Current Balance: {member.accumulatedMiles.toLocaleString()} miles
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {error && (
              <div className="field-error-message" role="alert" style={{ marginBottom: 'var(--space-2)' }}>
                <AlertCircle size={14} aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Transaction Type */}
            <div className="form-group">
              <label htmlFor="tx-type" className="form-label">
                Transaction Type <span className="label-required">*</span>
              </label>
              <select
                id="tx-type"
                className="form-control"
                value={type}
                onChange={(e) => {
                  setType(e.target.value as TransactionType);
                  setError(null);
                }}
              >
                <option value="Earn">Earn Miles (Credit Account)</option>
                <option value="Redeem">Redeem Miles (Debit Account)</option>
              </select>
            </div>

            {/* Amount */}
            <div className="form-group">
              <label htmlFor="tx-amount" className="form-label">
                Miles Amount <span className="label-required">*</span>
              </label>
              <input
                id="tx-amount"
                type="number"
                min="1"
                step="1"
                className={`form-control ${error && error.includes('amount') ? 'input-error' : ''}`}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. 5000"
                aria-required="true"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="tx-desc" className="form-label">
                Description <span className="label-required">*</span>
              </label>
              <input
                id="tx-desc"
                type="text"
                className="form-control"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Flight JFK to LHR / Upgrade redemption"
                aria-required="true"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Process Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
