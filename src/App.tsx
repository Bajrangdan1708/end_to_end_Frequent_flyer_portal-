import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DashboardStats } from './components/DashboardStats';
import { MemberTable } from './components/MemberTable';
import { MemberModal } from './components/MemberModal';
import { MemberDetailsModal } from './components/MemberDetailsModal';
import { MilesTransactionModal } from './components/MilesTransactionModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Member, MemberFormData, TransactionType } from './types';
import * as memberService from './services/memberService';
import { logAnalyticsInteraction } from './utils/analytics';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [detailsMember, setDetailsMember] = useState<Member | null>(null);
  const [milesMember, setMilesMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load members from service
  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load frequent flyer members';
      setError(msg.includes('Failed to load') ? msg : `Failed to load frequent flyer members: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Create member handler
  const handleCreateMember = async (formData: MemberFormData) => {
    try {
      const created = await memberService.createMember(formData);
      setMembers((prev) => [created, ...prev]);
      logAnalyticsInteraction();
      addToast('success', `Member ${created.fullName} registered successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create member';
      addToast('error', msg);
      throw err;
    }
  };

  // Edit member handler
  const handleUpdateMember = async (formData: MemberFormData) => {
    if (!editingMember) return;
    try {
      const updated = await memberService.updateMember(editingMember.id, formData);
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      logAnalyticsInteraction();
      addToast('success', `Member ${updated.fullName} updated successfully.`);
      setEditingMember(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update member';
      addToast('error', msg);
      throw err;
    }
  };

  // Delete member handler
  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      setIsDeleting(true);
      await memberService.deleteMember(deletingMember.id);
      setMembers((prev) => prev.filter((m) => m.id !== deletingMember.id));
      logAnalyticsInteraction();
      addToast('success', `Member ${deletingMember.fullName} deleted successfully.`);
      setDeletingMember(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete member';
      addToast('error', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Miles transaction handler
  const handleProcessMiles = async (params: {
    memberId: string;
    type: TransactionType;
    amount: number;
    description: string;
  }) => {
    try {
      const result = await memberService.addTransaction(params);
      setMembers((prev) =>
        prev.map((m) => (m.id === result.member.id ? result.member : m))
      );
      if (detailsMember && detailsMember.id === result.member.id) {
        setDetailsMember(result.member);
      }
      logAnalyticsInteraction();
      addToast(
        'success',
        `Processed ${params.type} of ${params.amount.toLocaleString()} miles for ${result.member.fullName}.`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      addToast('error', msg);
      throw err;
    }
  };

  return (
    <ErrorBoundary>
      <div className="portal-app">
        <Header />

        <main role="main" className="app-container">
          <div className="hero-section">
            <div className="hero-text">
              <h1>Frequent Flyer Management</h1>
              <p>
                Manage frequent flyer member accounts, membership tiers, and mileage ledger balances across airline networks.
              </p>
            </div>
          </div>

          {/* Error Banner with Retry */}
          {error && (
            <div
              className="state-center-box"
              style={{
                background: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-6)',
                padding: 'var(--space-6)',
              }}
            >
              <AlertCircle size={24} color="var(--color-error)" aria-hidden="true" />
              <h2 style={{ fontSize: '1rem', color: 'var(--color-error)', margin: 'var(--space-2) 0' }}>
                {error}
              </h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={loadMembers}
              >
                <RefreshCw size={14} aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && !error && (
            <div className="state-center-box" role="status" aria-live="polite">
              <div className="spinner" aria-hidden="true"></div>
              <span>Loading members...</span>
            </div>
          )}

          {/* Main Dashboard Content */}
          {!loading && !error && (
            <>
              <DashboardStats members={members} />

              <MemberTable
                members={members}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                onOpenEditModal={(m) => setEditingMember(m)}
                onOpenDetailsModal={(m) => setDetailsMember(m)}
                onOpenMilesModal={(m) => setMilesMember(m)}
                onOpenDeleteModal={(m) => setDeletingMember(m)}
              />
            </>
          )}
        </main>

        {/* Create Member Modal */}
        <MemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateMember}
          existingMembers={members}
        />

        {/* Edit Member Modal */}
        <MemberModal
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          onSubmit={handleUpdateMember}
          memberToEdit={editingMember}
          existingMembers={members}
        />

        {/* Member Details & Ledger Modal */}
        <MemberDetailsModal
          isOpen={Boolean(detailsMember)}
          onClose={() => setDetailsMember(null)}
          member={detailsMember}
          onOpenMilesModal={(m) => setMilesMember(m)}
        />

        {/* Miles Transaction Modal */}
        <MilesTransactionModal
          isOpen={Boolean(milesMember)}
          onClose={() => setMilesMember(null)}
          member={milesMember}
          onSubmit={handleProcessMiles}
        />

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          isOpen={Boolean(deletingMember)}
          onClose={() => setDeletingMember(null)}
          onConfirm={handleDeleteMember}
          member={deletingMember}
          isDeleting={isDeleting}
        />

        {/* Accessible Toast Region */}
        <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </ErrorBoundary>
  );
}
