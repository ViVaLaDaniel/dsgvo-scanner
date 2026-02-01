import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeWebsite } from '@/lib/scan-engine';
import { chromium } from 'playwright-core';

// Mock playwright-core
vi.mock('playwright-core', () => ({
  chromium: {
    launch: vi.fn()
  }
}));

describe('Scan Engine (Unit)', () => {
  let mockRequestCallback: (request: any) => void;
  let mockPage: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mock page and browser
    mockPage = {
      on: vi.fn((event, callback) => {
        if (event === 'request') mockRequestCallback = callback;
      }),
      goto: vi.fn().mockResolvedValue({}),
      evaluate: vi.fn().mockResolvedValue({}),
      waitForTimeout: vi.fn().mockResolvedValue({}),
      content: vi.fn().mockResolvedValue('<html><body></body></html>'),
      close: vi.fn().mockResolvedValue({}),
    };

    const mockContext = {
      newPage: vi.fn().mockResolvedValue(mockPage),
      cookies: vi.fn().mockResolvedValue([]),
      close: vi.fn().mockResolvedValue({}),
    };

    const mockBrowser = {
      newContext: vi.fn().mockResolvedValue(mockContext),
      close: vi.fn().mockResolvedValue({}),
    };

    (chromium.launch as any).mockResolvedValue(mockBrowser);
  });

  it('should detect Google Fonts violation', async () => {
    // Setup: trigger request during goto
    mockPage.goto.mockImplementation(async () => {
      if (mockRequestCallback) {
        mockRequestCallback({ url: () => 'https://fonts.googleapis.com/css?family=Roboto' });
      }
    });

    const result = await analyzeWebsite('https://example.com');

    expect(result.findings.some(f => f.title === 'Google Fonts (Remote)')).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it('should detect Google Tag Manager violation', async () => {
    mockPage.goto.mockImplementation(async () => {
      if (mockRequestCallback) {
        mockRequestCallback({ url: () => 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXX' });
      }
    });

    const result = await analyzeWebsite('https://example.com');

    expect(result.findings.some(f => f.title === 'Google Tag Manager')).toBe(true);
  });

  it('should return a high score for a clean website', async () => {
    const result = await analyzeWebsite('https://example.com');

    expect(result.score).toBe(98); 
    expect(result.findings.length).toBe(0);
  });

  it('should throw error if browser launch fails', async () => {
    (chromium.launch as any).mockRejectedValue(new Error('Browser launch failed'));

    await expect(analyzeWebsite('https://fail-site.com')).rejects.toThrow('Browser launch failed');
  });
});
