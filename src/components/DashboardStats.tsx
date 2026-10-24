import React from 'react';
import { Users, UserCheck, Award, Compass } from 'lucide-react';
import { Member, MembershipTier } from '../types';

interface DashboardStatsProps {
  members: Member[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ members }) => {
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'Active').length;
  const totalMiles = members.reduce((sum, m) => sum + (Number(m.accumulatedMiles) || 0), 0);

  const tierCounts: Record<MembershipTier, number> = {
    Platinum: members.filter((m) => m.tier === 'Platinum').length,
    Gold: members.filter((m) => m.tier === 'Gold').length,
    Silver: members.filter((m) => m.tier === 'Silver').length,
    Bronze: members.filter((m) => m.tier === 'Bronze').length,
  };

  return (
    <section aria-label="Portal Summary Metrics" className="stats-grid">
      {/* Total Members */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Members</span>
          <Users size={18} className="stat-icon" aria-hidden="true" />
        </div>
        <div className="stat-value" data-testid="stat-total-members">
          {totalMembers.toLocaleString()}
        </div>
        <div className="stat-subtext">Registered frequent flyer profiles</div>
      </div>

      {/* Active Members */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Active Members</span>
          <UserCheck size={18} className="stat-icon" aria-hidden="true" />
        </div>
        <div className="stat-value" data-testid="stat-active-members">
          {activeMembers.toLocaleString()}
        </div>
        <div className="stat-subtext">
          {totalMembers > 0
            ? `${Math.round((activeMembers / totalMembers) * 100)}% active account ratio`
            : '0% active account ratio'}
        </div>
      </div>

      {/* Total Accumulated Miles */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Accumulated Miles</span>
          <Compass size={18} className="stat-icon" aria-hidden="true" />
        </div>
        <div className="stat-value" data-testid="stat-total-miles">
          {totalMiles.toLocaleString()}
        </div>
        <div className="stat-subtext">Combined program liability balance</div>
      </div>

      {/* Tier Distribution */}
      <div className="stat-card">
        <div className="stat-card-header">
          <span className="stat-label">Tier Distribution</span>
          <Award size={18} className="stat-icon" aria-hidden="true" />
        </div>
        <div className="tier-dist-chips">
          <span className="tier-chip" title="Platinum Members">
            Platinum: {tierCounts.Platinum}
          </span>
          <span className="tier-chip" title="Gold Members">
            Gold: {tierCounts.Gold}
          </span>
          <span className="tier-chip" title="Silver Members">
            Silver: {tierCounts.Silver}
          </span>
          <span className="tier-chip" title="Bronze Members">
            Bronze: {tierCounts.Bronze}
          </span>
        </div>
        <div className="stat-subtext">Distribution across program levels</div>
      </div>
    </section>
  );
};
