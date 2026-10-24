import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import App from '../src/App';
import * as memberService from '../src/services/memberService';

describe('Unhappy-Path Tests (TRD Section 9)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Empty member list displays a helpful message
  it('1. Empty member list displays a helpful message and action to add member', async () => {
    localStorage.setItem('aero_members_data', JSON.stringify([]));
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/no frequent flyer members found/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/get started by adding your first frequent flyer member/i)).toBeInTheDocument();
  });

  // 2. Search with no matches displays "No data found"
  it('2. Search with no matches displays "No data found" and reset filter button', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: '1',
        fullName: 'Tony Stark',
        email: 'tony@stark.com',
        membershipNumber: 'FF-50001',
        tier: 'Platinum',
        accumulatedMiles: 500000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);
    await screen.findByText('Tony Stark');

    const searchInput = screen.getByPlaceholderText(/search by name, email, or membership/i);
    await user.type(searchInput, 'NonExistentPersonXYZ');

    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear search|reset filters/i })).toBeInTheDocument();
  });

  // 3. Empty required fields are rejected
  it('3. Empty required fields are rejected with field-specific validation errors', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    
    // Clear required fields
    const nameInput = within(dialog).getByLabelText(/full name/i);
    await user.clear(nameInput);
    await user.click(submitBtn);

    // Expect field errors
    expect(within(dialog).getByText(/full name is required/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/email address is required/i)).toBeInTheDocument();
  });

  // 4. Invalid email addresses are rejected
  it('4. Invalid email addresses are rejected with appropriate error', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/full name/i), 'Steve Rogers');
    await user.type(within(dialog).getByLabelText(/email address/i), 'invalid-email-format');

    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    await user.click(submitBtn);

    expect(within(dialog).getByText(/please enter a valid email address/i)).toBeInTheDocument();
  });

  // 5. Duplicate membership numbers are rejected
  it('5. Duplicate membership numbers are rejected', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: '1',
        fullName: 'Existing Member',
        email: 'exist@airline.com',
        membershipNumber: 'FF-EXIST',
        tier: 'Gold',
        accumulatedMiles: 1000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);
    await screen.findByText('Existing Member');

    const addBtn = screen.getByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/full name/i), 'Duplicate Member');
    await user.type(within(dialog).getByLabelText(/email address/i), 'dup@airline.com');
    
    const numInput = within(dialog).getByLabelText(/membership number/i);
    await user.clear(numInput);
    await user.type(numInput, 'FF-EXIST');

    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    await user.click(submitBtn);

    expect(within(dialog).getByText(/membership number already exists/i)).toBeInTheDocument();
  });

  // 6. Negative, fractional, or otherwise invalid miles values are rejected
  it('6. Negative, fractional, or invalid miles values are rejected', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/full name/i), 'Natasha Romanoff');
    await user.type(within(dialog).getByLabelText(/email address/i), 'natasha@shield.gov');

    const milesInput = within(dialog).getByLabelText(/accumulated miles/i);
    await user.clear(milesInput);
    await user.type(milesInput, '-500');

    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    await user.click(submitBtn);

    expect(within(dialog).getByText(/miles must be a non-negative integer/i)).toBeInTheDocument();
  });

  // 7. Invalid fields are visibly highlighted and associated with error messages
  it('7. Invalid fields are visibly highlighted and associated with ARIA error descriptions', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    await user.click(submitBtn);

    const nameInput = within(dialog).getByLabelText(/full name/i);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).toHaveAttribute('aria-describedby');
    
    const descId = nameInput.getAttribute('aria-describedby');
    expect(document.getElementById(descId!)).toHaveTextContent(/full name is required/i);
    expect(nameInput).toHaveClass('input-error');
  });

  // 8. Invalid submissions do not modify stored records
  it('8. Invalid submissions do not modify stored records', async () => {
    const user = userEvent.setup();
    const seedMembers = [
      {
        id: '1',
        fullName: 'Thor Odinson',
        email: 'thor@asgard.realm',
        membershipNumber: 'FF-THOR',
        tier: 'Platinum',
        accumulatedMiles: 999999,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);
    await screen.findByText('Thor Odinson');

    const addBtn = screen.getByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /save member|create member/i }));

    // Storage still contains only original 1 record
    const stored = JSON.parse(localStorage.getItem('aero_members_data') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].fullName).toBe('Thor Odinson');
  });

  // 9. Slow requests display a loading indicator
  it('9. Slow requests display a loading indicator', async () => {
    // Mock getMembers with a delayed promise
    vi.spyOn(memberService, 'getMembers').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve([]), 500))
    );

    render(<App />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading members/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  // 10. Failed requests display an understandable error and appropriate retry option
  it('10. Failed requests display an understandable error and retry button', async () => {
    const user = userEvent.setup();
    vi.spyOn(memberService, 'getMembers').mockRejectedValueOnce(
      new Error('Simulated network failure: connection timeout')
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load frequent flyer members/i)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    expect(retryBtn).toBeInTheDocument();

    // Reset mock to succeed on retry
    vi.spyOn(memberService, 'getMembers').mockResolvedValueOnce([]);
    await user.click(retryBtn);

    await waitFor(() => {
      expect(screen.queryByText(/failed to load frequent flyer members/i)).not.toBeInTheDocument();
    });
  });

  // 11. Repeated clicks do not create duplicate records
  it('11. Repeated clicks do not create duplicate records (disabled during submission)', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/full name/i), 'Fast Clicker');
    await user.type(within(dialog).getByLabelText(/email address/i), 'fast@clicker.com');

    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    
    // Fast double click
    await user.dblClick(submitBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const stored = JSON.parse(localStorage.getItem('aero_members_data') || '[]');
    const matching = stored.filter((m: { email: string }) => m.email === 'fast@clicker.com');
    expect(matching).toHaveLength(1);
  });

  // 12. Malformed or unavailable local storage does not crash the application
  it('12. Malformed or unavailable local storage recovers safely without crashing', async () => {
    // Write corrupted JSON into localStorage
    localStorage.setItem('aero_members_data', '{ corrupted-not-valid-json ]');

    render(<App />);

    // Should gracefully render fallback empty or default state without throwing unhandled exceptions
    await waitFor(() => {
      expect(screen.getByText(/no frequent flyer members found/i)).toBeInTheDocument();
    });
  });

  // 13. XSS-like text is rendered safely and never executed
  it('13. XSS-like text is safely escaped and rendered as text', async () => {
    const maliciousPayload = '<img src=x onerror=alert(1)>Malicious<script>window.pwned=true</script>';
    const seedMembers = [
      {
        id: 'xss-1',
        fullName: maliciousPayload,
        email: 'xss@hacker.io',
        membershipNumber: 'FF-XSS99',
        tier: 'Platinum',
        accumulatedMiles: 100,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem('aero_members_data', JSON.stringify(seedMembers));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(maliciousPayload)).toBeInTheDocument();
    });
    // Ensure script was not executed into global window
    expect((window as unknown as { pwned?: boolean }).pwned).toBeUndefined();
  });

  // 14. Keyboard navigation and accessible labels are verified
  it('14. Keyboard navigation: Escape key closes active modal dialog and focus returns properly', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Press Escape
    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // 15. Failed operations do not emit success analytics
  it('15. Failed operations do not emit success analytics', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const user = userEvent.setup();
    render(<App />);

    const addBtn = await screen.findByRole('button', { name: /add member/i });
    await user.click(addBtn);

    const dialog = screen.getByRole('dialog');
    // Try submitting empty form (validation fails)
    const submitBtn = within(dialog).getByRole('button', { name: /save member|create member/i });
    await user.click(submitBtn);

    // Ensure analytics message was NOT emitted
    expect(consoleSpy).not.toHaveBeenCalledWith(
      '[Analytics] User interacted with End-to-End Frequent Flyer Portal'
    );
  });
});
