import { Member, MemberFormData, Transaction, TransactionType } from '../types';
import { sanitizeString } from '../utils/validation';

const STORAGE_KEY_MEMBERS = 'aero_members_data';
const STORAGE_KEY_TRANSACTIONS = 'aero_transactions_data';

// Default initial corporate members dataset
const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'mem-101',
    fullName: 'Alexander Wright',
    email: 'a.wright@globallogistics.com',
    membershipNumber: 'FF-88401',
    tier: 'Platinum',
    accumulatedMiles: 145000,
    status: 'Active',
    createdAt: '2025-11-10T08:30:00.000Z',
    updatedAt: '2026-02-14T14:20:00.000Z',
  },
  {
    id: 'mem-102',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@skynav.eu',
    membershipNumber: 'FF-74291',
    tier: 'Gold',
    accumulatedMiles: 68200,
    status: 'Active',
    createdAt: '2025-12-05T11:15:00.000Z',
    updatedAt: '2026-03-01T09:45:00.000Z',
  },
  {
    id: 'mem-103',
    fullName: 'Marcus Vance',
    email: 'm.vance@techcorp.co',
    membershipNumber: 'FF-61902',
    tier: 'Silver',
    accumulatedMiles: 34100,
    status: 'Active',
    createdAt: '2026-01-20T16:00:00.000Z',
    updatedAt: '2026-02-28T17:10:00.000Z',
  },
  {
    id: 'mem-104',
    fullName: 'Sophia Chen',
    email: 'sophia.chen@apexholding.org',
    membershipNumber: 'FF-53108',
    tier: 'Bronze',
    accumulatedMiles: 12500,
    status: 'Inactive',
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-15T12:00:00.000Z',
  },
  {
    id: 'mem-105',
    fullName: 'David Sterling',
    email: 'd.sterling@aeroinvest.com',
    membershipNumber: 'FF-92415',
    tier: 'Platinum',
    accumulatedMiles: 210000,
    status: 'Active',
    createdAt: '2025-09-14T07:45:00.000Z',
    updatedAt: '2026-03-10T11:30:00.000Z',
  },
];

/**
 * Generate a unique 5-digit membership number
 */
export const generateMembershipNumber = (existingMembers: Member[]): string => {
  let attempt = 0;
  while (attempt < 1000) {
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const candidate = `FF-${randomSuffix}`;
    if (!existingMembers.some((m) => m.membershipNumber.toUpperCase() === candidate)) {
      return candidate;
    }
    attempt++;
  }
  return `FF-${Date.now().toString().slice(-5)}`;
};

/**
 * Safely parse storage items with defensive recovery
 */
const safeLoadMembers = (): Member[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MEMBERS);
    if (raw === null) {
      // First time initialization: populate default members
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(DEFAULT_MEMBERS));
      return DEFAULT_MEMBERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn('Storage data corrupted (not an array). Reverting to empty array.');
      return [];
    }
    return parsed;
  } catch (error) {
    console.error('Storage parsing failed. Corrupted JSON detected. Reverting to empty state.', error);
    return [];
  }
};

/**
 * Safely parse transactions
 */
const safeLoadTransactions = (): Transaction[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Transactions storage parsing failed.', error);
    return [];
  }
};

/**
 * Save members to localStorage
 */
const saveMembers = (members: Member[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
  } catch (error) {
    console.error('Failed to write members to localStorage', error);
  }
};

/**
 * Save transactions to localStorage
 */
const saveTransactions = (transactions: Transaction[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Failed to write transactions to localStorage', error);
  }
};

/**
 * Get all frequent flyer members
 */
export const getMembers = async (): Promise<Member[]> => {
  // Simulate realistic network delay
  await new Promise((resolve) => setTimeout(resolve, 30));
  return safeLoadMembers();
};

/**
 * Create a new frequent flyer member
 */
export const createMember = async (formData: MemberFormData): Promise<Member> => {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const currentMembers = safeLoadMembers();

  const membershipNumber =
    formData.membershipNumber && formData.membershipNumber.trim()
      ? sanitizeString(formData.membershipNumber.toUpperCase())
      : generateMembershipNumber(currentMembers);

  // Check uniqueness of membership number
  if (
    currentMembers.some(
      (m) => m.membershipNumber.toUpperCase() === membershipNumber
    )
  ) {
    throw new Error('Membership number already exists');
  }

  const now = new Date().toISOString();
  const newMember: Member = {
    id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fullName: sanitizeString(formData.fullName),
    email: sanitizeString(formData.email),
    membershipNumber,
    tier: formData.tier,
    accumulatedMiles: Number(formData.accumulatedMiles) || 0,
    status: formData.status,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newMember, ...currentMembers];
  saveMembers(updated);
  return newMember;
};

/**
 * Update an existing member
 */
export const updateMember = async (
  id: string,
  formData: MemberFormData
): Promise<Member> => {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const currentMembers = safeLoadMembers();
  const memberIndex = currentMembers.findIndex((m) => m.id === id);

  if (memberIndex === -1) {
    throw new Error('Member not found');
  }

  const membershipNumber =
    formData.membershipNumber && formData.membershipNumber.trim()
      ? sanitizeString(formData.membershipNumber.toUpperCase())
      : currentMembers[memberIndex].membershipNumber;

  // Check duplicate membership number against other members
  const duplicate = currentMembers.some(
    (m) => m.id !== id && m.membershipNumber.toUpperCase() === membershipNumber
  );
  if (duplicate) {
    throw new Error('Membership number already exists');
  }

  const updatedMember: Member = {
    ...currentMembers[memberIndex],
    fullName: sanitizeString(formData.fullName),
    email: sanitizeString(formData.email),
    membershipNumber,
    tier: formData.tier,
    accumulatedMiles: Number(formData.accumulatedMiles),
    status: formData.status,
    updatedAt: new Date().toISOString(),
  };

  currentMembers[memberIndex] = updatedMember;
  saveMembers(currentMembers);
  return updatedMember;
};

/**
 * Delete a member
 */
export const deleteMember = async (id: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const currentMembers = safeLoadMembers();
  const filtered = currentMembers.filter((m) => m.id !== id);
  saveMembers(filtered);

  // Also clean up any associated transactions
  const transactions = safeLoadTransactions();
  const remainingTx = transactions.filter((t) => t.memberId !== id);
  saveTransactions(remainingTx);
};

/**
 * Get transactions for a member
 */
export const getTransactions = async (memberId: string): Promise<Transaction[]> => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  const transactions = safeLoadTransactions();
  return transactions
    .filter((t) => t.memberId === memberId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

/**
 * Record a miles transaction (Earn or Redeem)
 * Atomically updates member accumulated miles balance
 */
export const addTransaction = async (params: {
  memberId: string;
  type: TransactionType;
  amount: number;
  description: string;
}): Promise<{ member: Member; transaction: Transaction }> => {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const currentMembers = safeLoadMembers();
  const memberIndex = currentMembers.findIndex((m) => m.id === params.memberId);

  if (memberIndex === -1) {
    throw new Error('Member not found for transaction');
  }

  const member = currentMembers[memberIndex];
  const amount = Math.floor(Math.abs(params.amount));

  if (params.type === 'Redeem' && member.accumulatedMiles < amount) {
    throw new Error(
      `Insufficient miles. Available balance: ${member.accumulatedMiles.toLocaleString()}`
    );
  }

  const newBalance =
    params.type === 'Earn'
      ? member.accumulatedMiles + amount
      : member.accumulatedMiles - amount;

  const now = new Date().toISOString();
  const newTransaction: Transaction = {
    id: `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    memberId: params.memberId,
    type: params.type,
    amount,
    description: sanitizeString(params.description),
    timestamp: now,
    balanceAfter: newBalance,
  };

  const updatedMember: Member = {
    ...member,
    accumulatedMiles: newBalance,
    updatedAt: now,
  };

  currentMembers[memberIndex] = updatedMember;
  saveMembers(currentMembers);

  const transactions = safeLoadTransactions();
  transactions.unshift(newTransaction);
  saveTransactions(transactions);

  return { member: updatedMember, transaction: newTransaction };
};
