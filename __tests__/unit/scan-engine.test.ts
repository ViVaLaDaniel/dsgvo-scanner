import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeWebsite } from '@/lib/scan-engine';

// Mock global fetch
global.fetch = vi.fn();

describe('Scan Engine (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect Google Fonts violation', async () => {
    const mockHtml = `
      <html>
        <head>
          <link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet">
        </head>
      </html>
    `;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const result = await analyzeWebsite('https://example.com');

    expect(result.findings.some(f => f.title === 'Google Fonts (Remote)')).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it('should detect Google Tag Manager violation', async () => {
    const mockHtml = `
      <script src="https://www.googletagmanager.com/gtm.js?id=GTM-XXXX"></script>
    `;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const result = await analyzeWebsite('https://example.com');

    expect(result.findings.some(f => f.title === 'Google Tag Manager')).toBe(true);
  });

  it('should return a high score for a clean website', async () => {
    const mockHtml = `<html><body><h1>Clean Site</h1></body></html>`;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const result = await analyzeWebsite('https://example.com');

    expect(result.score).toBe(98); // Our scan engine defaults to 98 for clean sites
    expect(result.findings.length).toBe(0);
  });

  it('should throw error if website fetch fails', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    });

    await expect(analyzeWebsite('https://404-site.com')).rejects.toThrow('Cloud not fetch website: Not Found');
  });
});
