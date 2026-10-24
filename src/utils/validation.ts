import { FormErrors, MemberFormData } from '../types';

/**
 * Basic XSS string sanitizer
 * Strips script tags, javascript: protocols, and trims whitespace
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

/**
 * Validate email address format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate Member Form Data
 */
export const validateMemberForm = (
  data: Partial<MemberFormData>,
  existingMembers: Array<{ id: string; membershipNumber: string; email: string }>,
  currentMemberId?: string
): { isValid: boolean; errors: FormErrors } => {
  const errors: FormErrors = {};

  // Full Name
  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = 'Full name is required';
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }

  // Email
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Please enter a valid email address';
  }

  // Membership Number (if provided, must be unique)
  if (data.membershipNumber && data.membershipNumber.trim()) {
    const formattedNumber = data.membershipNumber.trim().toUpperCase();
    const isDuplicate = existingMembers.some(
      (m) => m.membershipNumber.toUpperCase() === formattedNumber && m.id !== currentMemberId
    );
    if (isDuplicate) {
      errors.membershipNumber = 'Membership number already exists';
    }
  }

  // Accumulated Miles
  if (data.accumulatedMiles === undefined || data.accumulatedMiles === null || String(data.accumulatedMiles).trim() === '') {
    errors.accumulatedMiles = 'Accumulated miles is required';
  } else {
    const milesNum = Number(data.accumulatedMiles);
    if (isNaN(milesNum) || milesNum < 0 || !Number.isInteger(milesNum)) {
      errors.accumulatedMiles = 'Miles must be a non-negative integer';
    }
  }

  // Tier
  if (!data.tier || !['Bronze', 'Silver', 'Gold', 'Platinum'].includes(data.tier)) {
    errors.tier = 'Please select a valid membership tier';
  }

  // Status
  if (!data.status || !['Active', 'Inactive', 'Suspended'].includes(data.status)) {
    errors.status = 'Please select a valid account status';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate Miles Transaction
 */
export const validateTransaction = (
  type: 'Earn' | 'Redeem',
  amount: number,
  currentBalance: number,
  description: string
): { isValid: boolean; error?: string } => {
  if (isNaN(amount) || amount <= 0 || !Number.isInteger(amount)) {
    return { isValid: false, error: 'Transaction amount must be a positive integer greater than zero' };
  }
  if (!description || !description.trim()) {
    return { isValid: false, error: 'Transaction description is required' };
  }
  if (type === 'Redeem' && amount > currentBalance) {
    return { isValid: false, error: `Insufficient miles balance. Current balance is ${currentBalance.toLocaleString()} miles.` };
  }
  return { isValid: true };
};
