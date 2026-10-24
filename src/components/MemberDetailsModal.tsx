import React, { useEffect, useState } from 'react';
import { X, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { Member, Transaction } from '../types';
import { getTransactions } from '../services/memberService';

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onOpenMilesModal: (member: Member) => void;
}

export const MemberDetailsModal: React.FC<MemberDetailsModalProps> = ({
  isOpen,
  onClose,
  member,
  onOpenMilesModal,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isOpen && member) {
      setLoadingTx(true);
      getTransactions(member.id)
        .then((txs) => {
          if (isMounted) setTransactions(txs);
        })
        .catch((err) => console.error('Failed to load member transactions', err))
        .finally(() => {
          if (isMounted) setLoadingTx(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, member]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !member) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-details-title"
        style={{ maxWidth: '640px' }}
      >
        <div className="modal-header">
          <div>
            <h2 id="member-details-title" className="modal-title">
              {member.fullName}
            </h2>
            <div className="mono-num" style={{ marginTop: '2px' }}>
              {member.membershipNumber}
            </div>
          </div>
          <button
            type="button"
            className="btn-icon"
            onClick={onClose}
            aria-label="Close modal dialog"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="modal-body">
          {/* Member Metadata Grid */}
          <div className="detail-meta-grid">
            <div className="detail-meta-item">
              <label>Email Address</label>
              <span>{member.email}</span>
            </div>
            <div className="detail-meta-item">
              <label>Membership Tier</label>
              <span className={`badge-tier tier-${member.tier}`}>
                {member.tier}
              </span>
            </div>
            <div className="detail-meta-item">
              <label>Current Miles Balance</label>
              <span style={{ fontSize: '1.25rem' }}>
                {member.accumulatedMiles.toLocaleString()}
              </span>
            </div>
            <div className="detail-meta-item">
              <label>Account Status</label>
              <span className={`badge-status status-${member.status}`}>
                <span className="status-dot" aria-hidden="true"></span>
                {member.status}
              </span>
            </div>
            <div className="detail-meta-item">
              <label>Member Since</label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                {new Date(member.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="detail-meta-item">
              <label>Last Profile Update</label>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                {new Date(member.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Quick Miles Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Miles Activity & History</h3>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                onClose();
                onOpenMilesModal(member);
              }}
            >
              Earn / Redeem Miles
            </button>
          </div>

          {/* Transaction History Table */}
          {loadingTx ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-4)', color: 'var(--color-text-muted)' }}>
              Loading transaction ledger...
            </div>
          ) : transactions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-6)',
                background: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
                fontSize: '0.875rem',
              }}
            >
              <Clock size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              No miles transactions recorded yet for this member.
            </div>
          ) : (
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-subtle)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ padding: '8px 12px' }}>Type</th>
                    <th style={{ padding: '8px 12px' }}>Description</th>
                    <th style={{ padding: '8px 12px' }}>Miles</th>
                    <th style={{ padding: '8px 12px' }}>Balance After</th>
                    <th style={{ padding: '8px 12px' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '8px 12px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 600,
                            color: tx.type === 'Earn' ? 'var(--color-success)' : 'var(--color-error)',
                          }}
                        >
                          {tx.type === 'Earn' ? (
                            <ArrowDownLeft size={14} aria-hidden="true" />
                          ) : (
                            <ArrowUpRight size={14} aria-hidden="true" />
                          )}
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: '8px 12px' }}>{tx.description}</td>
                      <td style={{ padding: '8px 12px', fontWeight: 600 }}>
                        {tx.type === 'Earn' ? '+' : '-'}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--color-text-secondary)' }}>
                        {tx.balanceAfter.toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 12px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
