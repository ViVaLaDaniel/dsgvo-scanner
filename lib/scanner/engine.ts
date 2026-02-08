import { chromium } from 'playwright-core';
import { SCAN_PATTERNS, Finding } from './patterns';

/**
 * Core Scanning Engine Utility (Refactored)
 */

export interface ScanResult {
  score: number;
  findings: Finding[];
}

// Optimization: Pre-compile a single Master Regex for O(N) scanning
const MASTER_REGEX = new RegExp(
  Object.entries(SCAN_PATTERNS)
    .map(([key, p]) => `(?<${key}>${p.regex.source})`)
    .join('|'),
  'gi'
);

export function scanHtmlContent(html: string, detectedKeys: Set<string>): Finding[] {
  const newFindings: Finding[] = [];
  MASTER_REGEX.lastIndex = 0; // Reset state

  let match;
  while ((match = MASTER_REGEX.exec(html)) !== null) {
    if (!match.groups) continue;

    // Find which pattern matched
    for (const key in match.groups) {
      if (match.groups[key] !== undefined && !detectedKeys.has(key)) {
        detectedKeys.add(key);
        const pattern = SCAN_PATTERNS[key as keyof typeof SCAN_PATTERNS];
        newFindings.push({
          ...pattern.finding,
          technical_details: {
            source: 'static_analysis',
            match: match.groups[key].substring(0, 200)
          }
        } as Finding);
        break;
      }
    }
  }
  return newFindings;
}

interface RemoteScanResponse {
  score: number;
  findings: string[];
  error?: string;
  cookies_count?: number;
}

export async function analyzeWebsite(url: string): Promise<ScanResult> {
  const REMOTE_SCANNER_URL = process.env.SCANNER_MICROSERVICE_URL;
  const REMOTE_SCANNER_SECRET = process.env.SCANNER_SECRET;

  if (REMOTE_SCANNER_URL) {
    console.log(`[ScanEngine] Delegating scan to microservice: ${REMOTE_SCANNER_URL}`);
    try {
      const response = await fetch(REMOTE_SCANNER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, secret: REMOTE_SCANNER_SECRET })
      });

      if (!response.ok) {
        throw new Error(`Microservice error: ${response.status} ${response.statusText}`);
      }

      const data: RemoteScanResponse = await response.json();

      if (data.error) throw new Error(data.error);

      const structuredFindings: Finding[] = [];
      const detectedKeys = new Set<string>();

      if (data.findings) {
        const potentialFindings = [
          { key: 'GOOGLE_FONTS', match: 'Google Fonts' },
          { key: 'GOOGLE_TAG_MANAGER', match: 'Google Tag Manager' },
          { key: 'GOOGLE_ANALYTICS', match: 'Google Analytics' },
          { key: 'YOUTUBE', match: 'YouTube' },
          { key: 'FONTAWESOME_CDN', match: 'Font Awesome' }
        ];

        for (const fText of data.findings) {
          for (const p of potentialFindings) {
            if (fText.includes(p.match) && !detectedKeys.has(p.key)) {
              detectedKeys.add(p.key);
              structuredFindings.push(SCAN_PATTERNS[p.key as keyof typeof SCAN_PATTERNS].finding as Finding);
            }
          }
           if (fText.includes('Cookies detected') && !detectedKeys.has('COOKIES')) {
              detectedKeys.add('COOKIES');
              structuredFindings.push({
                category: 'Cookies',
                title: 'Cookies detected (Unconsented)',
                status: 'warning',
                severity: 'medium',
                description_de: `Es wurden Cookies erkannt, bevor der Nutzer seine Einwilligung gegeben hat.`,
                recommendation_de: 'Stellen Sie sicher, dass alle nicht notwendigen Cookies blockiert werden.',
                technical_details: { raw: fText }
              } as Finding);
           }
        }
      }

      return { score: data.score, findings: structuredFindings };

    } catch (error) {
       console.error('[ScanEngine] Remote scan failed:', error);
       throw error;
    }
  }

  console.log('[ScanEngine] Running in LOCAL mode (Playwright)');

  let score = 100;
  const findings: Finding[] = [];
  const detectedKeys = new Set<string>();
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Germani DSGVO Scanner/1.0 (Mozilla/5.0 Compliance Check)',
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    page.on('request', request => {
      const requestUrl = request.url();
      for (const [key, pattern] of Object.entries(SCAN_PATTERNS)) {
        if (pattern.regex.test(requestUrl) && !detectedKeys.has(key)) {
          detectedKeys.add(key);
          findings.push({
            ...pattern.finding,
            technical_details: { url: requestUrl }
          } as Finding);
        }
      }
    });

    try {
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    } catch (e: any) {
      console.warn(`Navigation timeout or error for ${url}, attempting to proceed with partial content:`, e.message);
    }

    try {
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 400;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight || totalHeight > 15000) {
              clearInterval(timer);
              resolve();
            }
          }, 50);
        });
      });
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.warn("Scroll failed or timed out, proceeding anyway");
    }

    const html = await page.content();
    const staticFindings = scanHtmlContent(html, detectedKeys);
    findings.push(...staticFindings);

    const cookies = await context.cookies();

    if (cookies.length > 0) {
      findings.push({
        category: 'Cookies',
        title: 'Cookies vor Einwilligung erkannt',
        status: 'warning',
        severity: 'medium',
        description_de: `Es wurden ${cookies.length} Cookies erkannt, bevor der Nutzer seine Einwilligung gegeben hat.`,
        recommendation_de: 'Stellen Sie sicher, dass alle nicht notwendigen Cookies blockiert werden.',
        technical_details: { count: cookies.length, names: cookies.map(c => c.name) }
      } as Finding);
    }

    for (const finding of findings) {
      if (finding.severity === 'high') score -= 20;
      else if (finding.severity === 'medium') score -= 10;
      else score -= 5;
    }

    score = Math.max(0, score);
    if (findings.length === 0 && score === 100) score = 98;

    return { score, findings };

  } catch (error) {
    console.error('Playwright Scan Error:', error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
}
