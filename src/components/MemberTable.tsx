import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Coins,
  Inbox,
  SearchX,
  ArrowUpDown,
} from 'lucide-react';
import { Member, MembershipTier } from '../types';

interface MemberTableProps {
  members: Member[];
  onOpenAddModal: () => void;
  onOpenEditModal: (member: Member) => void;
  onOpenDetailsModal: (member: Member) => void;
  onOpenMilesModal: (member: Member) => void;
  onOpenDeleteModal: (member: Member) => void;
}

type SortField = 'fullName' | 'accumulatedMiles' | 'tier' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export const MemberTable: React.FC<MemberTableProps> = ({
  members,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailsModal,
  onOpenMilesModal,
  onOpenDeleteModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filtered and sorted members list
  const filteredMembers = useMemo(() => {
    return members
      .filter((m) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = m.fullName.toLowerCase().includes(q);
          const matchesEmail = m.email.toLowerCase().includes(q);
          const matchesNumber = m.membershipNumber.toLowerCase().includes(q);
          if (!matchesName && !matchesEmail && !matchesNumber) return false;
        }

        // Tier filter
        if (tierFilter !== 'all' && m.tier !== tierFilter) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && m.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'fullName') {
          comp = a.fullName.localeCompare(b.fullName);
        } else if (sortField === 'accumulatedMiles') {
          comp = (a.accumulatedMiles || 0) - (b.accumulatedMiles || 0);
        } else if (sortField === 'tier') {
          const tierWeight: Record<MembershipTier, number> = {
            Bronze: 1,
            Silver: 2,
            Gold: 3,
            Platinum: 4,
          };
          comp = (tierWeight[a.tier] || 0) - (tierWeight[b.tier] || 0);
        } else if (sortField === 'createdAt') {
          comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [members, searchQuery, tierFilter, statusFilter, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setTierFilter('all');
    setStatusFilter('all');
  };

  // Case 1: Entire repository has no members at all
  if (members.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <div className="empty-icon-box" aria-hidden="true">
            <Inbox size={28} />
          </div>
          <h3>No frequent flyer members found</h3>
          <p>
            Get started by adding your first frequent flyer member to begin tracking tier distributions and miles transactions.
          </p>
          <button type="button" className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} aria-hidden="true" />
            <span>Add Member</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Controls Bar: Search, Filters, and Add Button */}
      <div className="controls-bar">
        <div className="search-box-wrapper">
          <label htmlFor="member-search" className="sr-only" style={{ display: 'none' }}>
            Search Members
          </label>
          <Search size={16} className="search-icon" aria-hidden="true" />
          <input
            id="member-search"
            type="search"
            className="search-input"
            placeholder="Search by name, email, or membership number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search by name, email, or membership number"
          />
        </div>

        <div className="filters-group">
          {/* Tier Filter */}
          <div>
            <label htmlFor="filter-tier" className="sr-only" style={{ display: 'none' }}>
              Filter by Tier
            </label>
            <select
              id="filter-tier"
              className="select-filter"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              aria-label="Filter by Tier"
            >
              <option value="all">All Tiers</option>
              <option value="Platinum">Platinum</option>
              <option value="Gold">Gold</option>
              <option value="Silver">Silver</option>
              <option value="Bronze">Bronze</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="filter-status" className="sr-only" style={{ display: 'none' }}>
              Filter by Status
            </label>
            <select
              id="filter-status"
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by Status"
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Add Member Primary Button */}
          <button type="button" className="btn btn-primary" onClick={onOpenAddModal}>
            <Plus size={16} aria-hidden="true" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Case 2: Filter/Search returned zero results */}
      {filteredMembers.length === 0 ? (
        <div className="table-card">
          <div className="empty-state">
            <div className="empty-icon-box" aria-hidden="true">
              <SearchX size={28} />
            </div>
            <h3>No data found</h3>
            <p>
              No frequent flyer records match your search or filter criteria. Try clearing your query or resetting filters.
            </p>
            <button type="button" className="btn btn-secondary" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        /* Case 3: Display Member Table */
        <div className="table-card">
          <div className="table-responsive">
            <table className="data-table" aria-label="Frequent Flyer Members">
              <thead>
                <tr>
                  <th scope="col">
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ fontWeight: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => toggleSort('fullName')}
                    >
                      <span>Member</span>
                      <ArrowUpDown size={12} aria-hidden="true" />
                    </button>
                  </th>
                  <th scope="col">Membership No.</th>
                  <th scope="col">
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ fontWeight: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => toggleSort('tier')}
                    >
                      <span>Tier</span>
                      <ArrowUpDown size={12} aria-hidden="true" />
                    </button>
                  </th>
                  <th scope="col">
                    <button
                      type="button"
                      className="btn-icon"
                      style={{ fontWeight: 'inherit', textTransform: 'inherit', letterSpacing: 'inherit', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={() => toggleSort('accumulatedMiles')}
                    >
                      <span>Miles</span>
                      <ArrowUpDown size={12} aria-hidden="true" />
                    </button>
                  </th>
                  <th scope="col">Status</th>
                  <th scope="col" style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-identity">
                        <span className="member-name">{member.fullName}</span>
                        <span className="member-email">{member.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="mono-num">{member.membershipNumber}</span>
                    </td>
                    <td>
                      <span className={`badge-tier tier-${member.tier}`}>
                        {member.tier}
                      </span>
                    </td>
                    <td>
                      <strong style={{ fontWeight: 600 }}>
                        {member.accumulatedMiles.toLocaleString()}
                      </strong>
                    </td>
                    <td>
                      <span className={`badge-status status-${member.status}`}>
                        <span className="status-dot" aria-hidden="true"></span>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onOpenDetailsModal(member)}
                          aria-label={`View details for ${member.fullName}`}
                          title="View profile and ledger"
                        >
                          <Eye size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onOpenMilesModal(member)}
                          aria-label={`Manage miles for ${member.fullName}`}
                          title="Earn or redeem miles"
                        >
                          <Coins size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onOpenEditModal(member)}
                          aria-label={`Edit ${member.fullName}`}
                          title="Edit member details"
                        >
                          <Edit2 size={16} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => onOpenDeleteModal(member)}
                          aria-label={`Delete ${member.fullName}`}
                          title="Delete member"
                        >
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
