export type MembershipTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type AccountStatus = 'Active' | 'Inactive' | 'Suspended';

export type TransactionType = 'Earn' | 'Redeem';

export interface Transaction {
  id: string;
  memberId: string;
  type: TransactionType;
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  membershipNumber: string;
  tier: MembershipTier;
  accumulatedMiles: number;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MemberFormData {
  fullName: string;
  email: string;
  membershipNumber?: string;
  tier: MembershipTier;
  accumulatedMiles: number;
  status: AccountStatus;
}

export interface FormErrors {
  fullName?: string;
  email?: string;
  membershipNumber?: string;
  tier?: string;
  accumulatedMiles?: string;
  status?: string;
  general?: string;
}

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  tierDistribution: Record<MembershipTier, number>;
  totalMiles: number;
}
