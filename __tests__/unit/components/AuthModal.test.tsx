import { render, screen, fireEvent } from '@testing-library/react';
import { AuthModal } from '@/components/auth/AuthModal';
import { vi, describe, it, expect } from 'vitest';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
    },
  }),
}));

describe('AuthModal', () => {
  it('renders with Label components and accessible inputs', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} initialView="login" />);

    // Check for Labels associated with inputs
    const emailLabel = screen.getByText('E-Mail Adresse');
    expect(emailLabel.tagName).toBe('LABEL');
    expect(emailLabel).toHaveAttribute('for', 'auth-email');

    const passwordLabel = screen.getByText('Passwort');
    expect(passwordLabel.tagName).toBe('LABEL');
    expect(passwordLabel).toHaveAttribute('for', 'login-password');

    // Check inputs
    expect(screen.getByLabelText('E-Mail Adresse')).toBeInTheDocument();
    expect(screen.getByLabelText('Passwort')).toBeInTheDocument();
  });

  it('renders password toggle button with correct accessibility attributes', () => {
    render(<AuthModal isOpen={true} onClose={() => {}} initialView="login" />);

    const toggleButton = screen.getByLabelText('Passwort anzeigen');
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton.tagName).toBe('BUTTON');

    // Click to toggle
    fireEvent.click(toggleButton);
    expect(screen.getByLabelText('Passwort verbergen')).toBeInTheDocument();
  });
});
