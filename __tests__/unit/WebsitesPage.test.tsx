import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WebsitesPage from '@/app/dashboard/websites/page';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } }),
  },
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn().mockResolvedValue({ data: { website_limit: 5 } }),
  order: vi.fn().mockResolvedValue({ data: [] }),
  insert: vi.fn().mockResolvedValue({ error: null }),
  delete: vi.fn().mockResolvedValue({ error: null }),
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

describe('WebsitesPage Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default empty list
    mockSupabase.from().select().order.mockResolvedValue({ data: [] });
  });

  it('associates labels with inputs correctly in the Add Website form', async () => {
    render(<WebsitesPage />);

    const addButton = screen.getByRole('button', { name: /Website hinzufügen/i });
    fireEvent.click(addButton);

    const urlInput = await screen.findByLabelText('Website URL');
    expect(urlInput).toBeInTheDocument();
    expect(urlInput).toHaveAttribute('id', 'url');

    const clientInput = screen.getByLabelText('Mandantenname');
    expect(clientInput).toBeInTheDocument();
    expect(clientInput).toHaveAttribute('id', 'client_name');
  });

  it('renders the delete button with an aria-label', async () => {
    // Mock existing websites
    const mockWebsites = [
      {
        id: '1',
        url: 'https://example.com',
        domain: 'example.com',
        client_name: 'Test Client',
        created_at: new Date().toISOString(),
        status: 'active',
      },
    ];

    // Override the mock for this test
    // Note: Since we use chainable mocks, we need to be careful.
    // The previous setup was: from().select().order.mock...
    // We need to ensure the chain works.
    mockSupabase.from().select().order.mockResolvedValue({ data: mockWebsites });

    render(<WebsitesPage />);

    // Wait for websites to load and check for the delete button by its aria-label
    const deleteButton = await screen.findByRole('button', { name: 'Website löschen' });
    expect(deleteButton).toBeInTheDocument();
  });
});
