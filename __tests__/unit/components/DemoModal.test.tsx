import { render, screen, fireEvent, act } from '@testing-library/react';
import { DemoModal } from '@/components/landing/DemoModal';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('DemoModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders inputs with accessible labels', () => {
    render(<DemoModal isOpen={true} onClose={() => {}} />);

    // This checks if inputs are properly associated with labels
    // These calls will FAIL if htmlFor/id are missing
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Firma/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-Mail Adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nachricht/i)).toBeInTheDocument();
  });

  it('shows loading state on submit', async () => {
    render(<DemoModal isOpen={true} onClose={() => {}} />);

    // Fill form (using getByLabelText to ensure accessibility)
    // If labels are broken, this test will fail here first
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText(/Firma/i), { target: { value: 'Test Co' } });
    fireEvent.change(screen.getByLabelText(/E-Mail Adresse/i), { target: { value: 'test@example.com' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Jetzt Demo anfragen/i });
    fireEvent.click(submitButton);

    // Check for loading state (Button should be disabled)
    expect(submitButton).toBeDisabled();

    // Fast-forward time to simulate API completion
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Check if success message is shown
    expect(screen.getByText(/Anfrage gesendet!/i)).toBeInTheDocument();
  });
});
