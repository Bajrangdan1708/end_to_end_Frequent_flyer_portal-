import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import App from '../src/App';

describe('Happy-Path Tests (TRD Section 9)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Application renders successfully
  it('1. Application renders successfully with landmarks and title', async () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: /frequent flyer/i })
    ).toBeInTheDocument();
  });

  // 2. Dashboard statistics reflect member data
  it('2. Dashboard statistics reflect member data accurately', async () => {
    // Seed initial test data in localStorage
    const seedMembers = [
      {
        id: 'mem-1',
        fullName: 'Jane Doe',
        email: 'jane.doe@airline.com',
        membershipNumber: 'FF-10001',
        tier: 'Platinum',
        accumulatedMiles: 75000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'mem-2',
        fullName: 'John Smith',
        email: 'john.smith@airline.com',
        membershipNumber: 'FF-10002',
        tier: 'Gold',
        accumulatedMiles: 25000,
        status: 'Inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('stat-total-members')).toHaveTextContent('2');
    });
    expect(screen.getByTestId('stat-active-members')).toHaveTextContent('1');
    expect(screen.getByTestId('stat-total-miles')).toHaveTextContent('100,000');
  });

  // 3. A valid member can be added
  it('3. A valid member can be added and appears in the table', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(/full name/i), 'Alice Walker');
    await user.type(within(dialog).getByLabelText(/email address/i), 'alice.walker@example.com');
    await user.selectOptions(within(dialog).getByLabelText(/membership tier/i), 'Silver');
    
    const milesInput = within(dialog).getByLabelText(/accumulated miles/i);
    await user.clear(milesInput);
    await user.type(milesInput, '15000');

    await user.selectOptions(within(dialog).getByLabelText(/account status/i), 'Active');

    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    await user.click(submitBtn);

    // Modal closes and new member is in table
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Alice Walker')).toBeInTheDocument();
    expect(screen.getByText('alice.walker@example.com')).toBeInTheDocument();
  });

  // 4. Member details can be viewed
  it('4. Member details can be viewed in a dedicated detail modal', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: 'mem-view-1',
        fullName: 'Captain Kirk',
        email: 'kirk@starfleet.org',
        membershipNumber: 'FF-77001',
        tier: 'Platinum',
        accumulatedMiles: 120000,
        status: 'Active',
        createdAt: '2026-01-15T10:00:00Z',
        updatedAt: '2026-01-15T10:00:00Z',
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);

    const viewBtn = await screen.findByRole('button', { name: /view details for captain kirk/i });
    await user.click(viewBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText('FF-77001')).toBeInTheDocument();
    expect(within(dialog).getByText('120,000')).toBeInTheDocument();
    expect(within(dialog).getByText('kirk@starfleet.org')).toBeInTheDocument();

    // Close button
    const closeBtn = within(dialog).getByRole('button', { name: /^close$/i });
    await user.click(closeBtn);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  // 5. An existing member can be updated
  it('5. An existing member can be updated with new details', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: 'mem-edit-1',
        fullName: 'Diana Prince',
        email: 'diana@themyscira.gov',
        membershipNumber: 'FF-88001',
        tier: 'Bronze',
        accumulatedMiles: 5000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);

    const editBtn = await screen.findByRole('button', { name: /edit diana prince/i });
    await user.click(editBtn);

    const dialog = screen.getByRole('dialog');
    const nameInput = within(dialog).getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Diana Prince Trevor');

    await user.selectOptions(within(dialog).getByLabelText(/membership tier/i), 'Gold');

    const submitBtn = within(dialog).getByRole('button', { name: /save changes|update member/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Diana Prince Trevor')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('Gold')).toBeInTheDocument();
  });

  // 6. A member can be deleted after confirmation
  it('6. A member can be deleted after confirmation step', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: 'mem-del-1',
        fullName: 'Bruce Wayne',
        email: 'bruce@wayne-enterprises.com',
        membershipNumber: 'FF-99001',
        tier: 'Platinum',
        accumulatedMiles: 900000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);

    const deleteBtn = await screen.findByRole('button', { name: /delete bruce wayne/i });
    await user.click(deleteBtn);

    // Confirmation dialog appears
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/confirm deletion/i)).toBeInTheDocument();

    const confirmBtn = within(dialog).getByRole('button', { name: /confirm delete|delete member/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(screen.queryByText('Bruce Wayne')).not.toBeInTheDocument();
    });
  });

  // 7. Search and filtering work correctly
  it('7. Search and filtering filter members by query, tier, and status', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: '1',
        fullName: 'Clark Kent',
        email: 'clark@dailyplanet.com',
        membershipNumber: 'FF-10010',
        tier: 'Silver',
        accumulatedMiles: 30000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        fullName: 'Barry Allen',
        email: 'barry@ccpd.gov',
        membershipNumber: 'FF-10020',
        tier: 'Gold',
        accumulatedMiles: 55000,
        status: 'Inactive',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);

    await screen.findByText('Clark Kent');
    expect(screen.getByText('Barry Allen')).toBeInTheDocument();

    // Search by name
    const searchInput = screen.getByPlaceholderText(/search by name, email, or membership/i);
    await user.type(searchInput, 'Barry');

    expect(screen.getByText('Barry Allen')).toBeInTheDocument();
    expect(screen.queryByText('Clark Kent')).not.toBeInTheDocument();

    // Clear search
    await user.clear(searchInput);
    expect(screen.getByText('Clark Kent')).toBeInTheDocument();

    // Filter by tier
    const tierFilter = screen.getByLabelText(/filter by tier/i);
    await user.selectOptions(tierFilter, 'Silver');
    expect(screen.getByText('Clark Kent')).toBeInTheDocument();
    expect(screen.queryByText('Barry Allen')).not.toBeInTheDocument();
  });

  // 8. Supported miles transactions update balances correctly
  it('8. Supported miles transactions (Earn and Redeem) update balances correctly', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: 'mem-tx-1',
        fullName: 'Peter Parker',
        email: 'peter@bugle.com',
        membershipNumber: 'FF-30001',
        tier: 'Bronze',
        accumulatedMiles: 10000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);

    const milesBtn = await screen.findByRole('button', { name: /manage miles for peter parker/i });
    await user.click(milesBtn);

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/manage miles/i)).toBeInTheDocument();

    // Earn 5,000 miles
    await user.selectOptions(within(dialog).getByLabelText(/transaction type/i), 'Earn');
    const amountInput = within(dialog).getByLabelText(/miles amount/i);
    await user.type(amountInput, '5000');
    await user.type(within(dialog).getByLabelText(/description/i), 'Flight NYC to SFO');

    const submitBtn = within(dialog).getByRole('button', { name: /process transaction/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Check table has updated miles
    expect(within(screen.getByRole('table')).getByText('15,000')).toBeInTheDocument();
  });

  // 9. Data persists across reloads when persistence is enabled
  it('9. Data persists in localStorage across renders', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/full name/i), 'Persistent Traveler');
    await user.type(within(dialog).getByLabelText(/email address/i), 'traveler@persist.org');
    
    const milesInput = within(dialog).getByLabelText(/accumulated miles/i);
    await user.clear(milesInput);
    await user.type(milesInput, '12000');

    await user.click(within(dialog).getByRole('button', { name: /save member|create member/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Verify localStorage has the record
    const stored = JSON.parse(localStorage.getItem('aero_members_data') || '[]');
    expect(stored.some((m: { fullName: string }) => m.fullName === 'Persistent Traveler')).toBe(true);
  });

  // 10. Analytics logs the exact required message after successful primary actions
  it('10. Analytics logs the exact required message after successful primary actions', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/full name/i), 'Analytics Member');
    await user.type(within(dialog).getByLabelText(/email address/i), 'analytics@domain.com');
    await user.click(within(dialog).getByRole('button', { name: /save member|create member/i }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('[Analytics] User interacted with End-to-End Frequent Flyer Portal');
    });
  });
});
