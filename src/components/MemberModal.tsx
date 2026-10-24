import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { AccountStatus, FormErrors, Member, MemberFormData, MembershipTier } from '../types';
import { validateMemberForm } from '../utils/validation';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => Promise<void>;
  memberToEdit?: Member | null;
  existingMembers: Member[];
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  memberToEdit,
  existingMembers,
}) => {
  const [formData, setFormData] = useState<MemberFormData>({
    fullName: '',
    email: '',
    membershipNumber: '',
    tier: 'Bronze',
    accumulatedMiles: 0,
    status: 'Active',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Initialize or reset form data when opening
  useEffect(() => {
    if (isOpen) {
      if (memberToEdit) {
        setFormData({
          fullName: memberToEdit.fullName,
          email: memberToEdit.email,
          membershipNumber: memberToEdit.membershipNumber,
          tier: memberToEdit.tier,
          accumulatedMiles: memberToEdit.accumulatedMiles,
          status: memberToEdit.status,
        });
      } else {
        setFormData({
          fullName: '',
          email: '',
          membershipNumber: '',
          tier: 'Bronze',
          accumulatedMiles: 0,
          status: 'Active',
        });
      }
      setErrors({});
      setIsSubmitting(false);

      // Focus first input
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, memberToEdit]);

  // Keyboard navigation: Escape key closes modal
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate form fields
    const validation = validateMemberForm(formData, existingMembers, memberToEdit?.id);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred while saving';
      if (message.toLowerCase().includes('membership number')) {
        setErrors((prev) => ({ ...prev, membershipNumber: message }));
      } else {
        setErrors((prev) => ({ ...prev, general: message }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = Boolean(memberToEdit);

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
        aria-labelledby="member-modal-title"
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="member-modal-title" className="modal-title">
            {isEdit ? 'Edit Frequent Flyer Member' : 'Register New Member'}
          </h2>
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
            {errors.general && (
              <div className="field-error-message" role="alert">
                <AlertCircle size={14} aria-hidden="true" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="member-fullname" className="form-label">
                Full Name <span className="label-required">*</span>
              </label>
              <input
                id="member-fullname"
                ref={firstInputRef}
                type="text"
                className={`form-control ${errors.fullName ? 'input-error' : ''}`}
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                }}
                aria-required="true"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'fullname-error' : undefined}
                placeholder="e.g. Jane Doe"
              />
              {errors.fullName && (
                <span id="fullname-error" className="field-error-message" role="alert">
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.fullName}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="member-email" className="form-label">
                Email Address <span className="label-required">*</span>
              </label>
              <input
                id="member-email"
                type="email"
                className={`form-control ${errors.email ? 'input-error' : ''}`}
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                aria-required="true"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                placeholder="e.g. jane.doe@example.com"
              />
              {errors.email && (
                <span id="email-error" className="field-error-message" role="alert">
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Membership Number */}
            <div className="form-group">
              <label htmlFor="member-number" className="form-label">
                Membership Number
              </label>
              <input
                id="member-number"
                type="text"
                className={`form-control ${errors.membershipNumber ? 'input-error' : ''}`}
                value={formData.membershipNumber || ''}
                onChange={(e) => {
                  setFormData({ ...formData, membershipNumber: e.target.value });
                  if (errors.membershipNumber) setErrors({ ...errors, membershipNumber: undefined });
                }}
                aria-invalid={Boolean(errors.membershipNumber)}
                aria-describedby={errors.membershipNumber ? 'number-error' : 'number-hint'}
                placeholder="Auto-generated if left blank (e.g. FF-10492)"
              />
              {errors.membershipNumber ? (
                <span id="number-error" className="field-error-message" role="alert">
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.membershipNumber}
                </span>
              ) : (
                <span id="number-hint" className="field-hint">
                  Leave blank to auto-generate a unique 5-digit number
                </span>
              )}
            </div>

            {/* Tier & Status Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              {/* Membership Tier */}
              <div className="form-group">
                <label htmlFor="member-tier" className="form-label">
                  Membership Tier <span className="label-required">*</span>
                </label>
                <select
                  id="member-tier"
                  className={`form-control ${errors.tier ? 'input-error' : ''}`}
                  value={formData.tier}
                  onChange={(e) =>
                    setFormData({ ...formData, tier: e.target.value as MembershipTier })
                  }
                  aria-required="true"
                  aria-invalid={Boolean(errors.tier)}
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                  <option value="Platinum">Platinum</option>
                </select>
                {errors.tier && (
                  <span className="field-error-message" role="alert">
                    {errors.tier}
                  </span>
                )}
              </div>

              {/* Account Status */}
              <div className="form-group">
                <label htmlFor="member-status" className="form-label">
                  Account Status <span className="label-required">*</span>
                </label>
                <select
                  id="member-status"
                  className={`form-control ${errors.status ? 'input-error' : ''}`}
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as AccountStatus })
                  }
                  aria-required="true"
                  aria-invalid={Boolean(errors.status)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
                {errors.status && (
                  <span className="field-error-message" role="alert">
                    {errors.status}
                  </span>
                )}
              </div>
            </div>

            {/* Accumulated Miles */}
            <div className="form-group">
              <label htmlFor="member-miles" className="form-label">
                Accumulated Miles <span className="label-required">*</span>
              </label>
              <input
                id="member-miles"
                type="number"
                min="0"
                step="1"
                className={`form-control ${errors.accumulatedMiles ? 'input-error' : ''}`}
                value={formData.accumulatedMiles}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    accumulatedMiles: val === '' ? ('' as unknown as number) : Number(val),
                  });
                  if (errors.accumulatedMiles) setErrors({ ...errors, accumulatedMiles: undefined });
                }}
                aria-required="true"
                aria-invalid={Boolean(errors.accumulatedMiles)}
                aria-describedby={errors.accumulatedMiles ? 'miles-error' : undefined}
              />
              {errors.accumulatedMiles && (
                <span id="miles-error" className="field-error-message" role="alert">
                  <AlertCircle size={12} aria-hidden="true" />
                  {errors.accumulatedMiles}
                </span>
              )}
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
              {isSubmitting
                ? 'Saving...'
                : isEdit
                ? 'Save Changes'
                : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
