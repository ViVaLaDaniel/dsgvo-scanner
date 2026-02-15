import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '@/components/ui/dialog';
import { describe, it, expect, vi } from 'vitest';

describe('Dialog', () => {
  it('renders close button with aria-label', () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={onClose} title="Test Dialog">
        <div>Content</div>
      </Dialog>
    );

    const closeButton = screen.getByLabelText('Schließen');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton.tagName).toBe('BUTTON');

    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
