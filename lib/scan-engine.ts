import { chromium } from 'playwright-core';

/**
 * Core Scanning Engine Utility (MVP)
 * Detects common privacy violations by analyzing HTML source code.
 */

export interface Finding {
  category: string;
  title: string;
  status: 'compliant' | 'violation' | 'warning';
  severity: 'low' | 'medium' | 'high';
  description_de: string;
  recommendation_de: string;
  impact_de?: string;
  technical_details?: any;
}

export interface ScanResult {
  score: number;
  findings: Finding[];
}

export const SCAN_PATTERNS = {
  GOOGLE_FONTS: {
    regex: /fonts\.(googleapis|gstatic)\.com/i,
    finding: {
      category: 'Drittanbieter & CDNs',
      title: 'Google Fonts (Remote)',
      status: 'violation',
      severity: 'high',
      description_de: 'Schriftarten werden direkt von Google-Servern geladen. Dabei wird die IP-Adresse des Nutzers in die USA übertragen.',
      recommendation_de: 'Laden Sie die Schriftarten herunter und hosten Sie diese lokal auf Ihrem eigenen Server.',
      impact_de: 'Abmahngefahr durch LG München I Urteil (Az. 3 O 191/22).'
    }
  },
  GOOGLE_TAG_MANAGER: {
    regex: /googletagmanager\.com\/gtm\.js/i,
    finding: {
      category: 'Tracking & Analytics',
      title: 'Google Tag Manager',
      status: 'violation',
      severity: 'high',
      description_de: 'GTM wird ohne vorherige Einwilligung des Nutzers geladen.',
      recommendation_de: 'Stellen Sie sicher, dass das GTM-Skript erst nach der Einwilligung im Cookie-Banner gefeuert wird.',
      impact_de: 'Verstoß gegen TDDDG & DSGVO.'
    }
  },
  GOOGLE_ANALYTICS: {
    regex: /(google-analytics\.com|googletagmanager\.com\/gtag\/js)/i,
    finding: {
      category: 'Tracking & Analytics',
      title: 'Google Analytics',
      status: 'violation',
      severity: 'high',
      description_de: 'Analytische Tracker werden ohne explizite Einwilligung geladen.',
      recommendation_de: 'Konfigurieren Sie Ihr Consent Management System so, dass Analytics blockiert wird, bis der Nutzer zustimmt.',
      impact_de: 'Unzulässige Datenverarbeitung ohne Rechtsgrundlage.'
    }
  },
  YOUTUBE: {
    regex: /youtube\.com\/embed/i,
    finding: {
      category: 'Medien',
      title: 'YouTube Embed (Standard)',
      status: 'warning',
      severity: 'medium',
      description_de: 'Eingebettete Videos laden Tracker von Google (doubleclick.net) bereits beim Seitenaufruf.',
      recommendation_de: 'Nutzen Sie youtube-nocookie.com oder implementieren Sie eine Zwei-Klick-Lösung.',
      impact_de: 'Unerwünschte Cookie-Setzung vor Abspielen des Videos.'
    }
  },
  FONTAWESOME_CDN: {
    regex: /font-awesome|kit\.fontawesome\.com/i,
    finding: {
      category: 'Drittanbieter & CDNs',
      title: 'Font Awesome CDN',
      status: 'violation',
      severity: 'medium',
      description_de: 'Icons werden von einem externen CDN geladen.',
      recommendation_de: 'Hosten Sie Icon-Fonts lokal oder nutzen Sie SVG-Icons.',
      impact_de: 'Datenübermittlung an Drittanbieter (USA).'
    }
  }
};

const PATTERN_KEYS = Object.keys(SCAN_PATTERNS);

// Optimization: Pre-compile a single Master Regex for O(N) scanning
// instead of looping through patterns O(N*M).
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
    for (const key of PATTERN_KEYS) {
      if (match.groups[key] !== undefined) {
        if (!detectedKeys.has(key)) {
          detectedKeys.add(key);
          const pattern = SCAN_PATTERNS[key as keyof typeof SCAN_PATTERNS];
          newFindings.push({
            ...pattern.finding,
            technical_details: {
              source: 'static_analysis',
              match: match.groups[key].substring(0, 200)
            }
          } as Finding);
        }
        // Optimization: Stop checking other keys once the match is found
        break;
      }
    }
  }
  return newFindings;
}

// Remote Scan Interface
interface RemoteScanResponse {
  score: number;
  findings: string[];
  error?: string;
  cookies_count?: number;
}

const REMOTE_SCAN_TIMEOUT_MS = 45000;
const REMOTE_SCAN_MAX_RETRIES = 2;

async function fetchWithTimeoutAndRetry(url: string, body: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt <= REMOTE_SCAN_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REMOTE_SCAN_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`Microservice error: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < REMOTE_SCAN_MAX_RETRIES) {
        const delayMs = 500 * 2 ** attempt;
        await new Promise(resolve => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
}

export async function analyzeWebsite(url: string): Promise<ScanResult> {
  // CONFIGURATION:
  // If SCANNER_MICROSERVICE_URL is set (e.g. in Vercel), use it.
  // Otherwise, try to run local Playwright (e.g. on localhost).
  const REMOTE_SCANNER_URL = process.env.SCANNER_MICROSERVICE_URL;
  const REMOTE_SCANNER_SECRET = process.env.SCANNER_SECRET;

  // MODE 1: REMOTE SCAN (For Vercel / Production)
  if (REMOTE_SCANNER_URL) {
    console.log(`[ScanEngine] Delegating scan to microservice: ${REMOTE_SCANNER_URL}`);
    try {
      const response = await fetchWithTimeoutAndRetry(
        REMOTE_SCANNER_URL,
        JSON.stringify({ url, secret: REMOTE_SCANNER_SECRET })
      );

      const data: RemoteScanResponse = await response.json();
      
      if (data.error) throw new Error(data.error);

      // Map raw string findings back to our structured objects
      const structuredFindings: Finding[] = [];
      const detectedKeys = new Set<string>();

      // Text-based matching from microservice response
      // (The microservice returns simple strings like "Google Fonts", we need to map them back to full Finding objects)
      if (data.findings) {
        const potentialFindings = [
          { key: 'GOOGLE_FONTS', match: 'Google Fonts' },
          { key: 'GOOGLE_TAG_MANAGER', match: 'Google Tag Manager' },
          { key: 'GOOGLE_ANALYTICS', match: 'Google Analytics' },
          { key: 'YOUTUBE', match: 'YouTube' }, // Matches "YouTube Embed"
          { key: 'FONTAWESOME_CDN', match: 'Font Awesome' }
        ];

        for (const fText of data.findings) {
          for (const p of potentialFindings) {
            if (fText.includes(p.match) && !detectedKeys.has(p.key)) {
              detectedKeys.add(p.key);
              structuredFindings.push(SCAN_PATTERNS[p.key as keyof typeof SCAN_PATTERNS].finding as Finding);
            }
          }
           // Special handling for generic cookies if not mapped
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
       // Fallback to static scan if remote fails? Or re-throw?
       // For now, re-throw because static scan is useless without HTML content
       throw error;
    }
  }

  // MODE 2: LOCAL SCAN (For Localhost Dev)
  // This code runs only if no REMOTE_SCANNER_URL is defined
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

    // 2. Network Interception
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

    // 3. Navigate and Wait
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    } catch (e: any) {
      console.warn(`Navigation timeout or error for ${url}, attempting to proceed with partial content:`, e.message);
    }

    // 4. Auto-Scroll to trigger lazy-loaded requests
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
      // Safety wait
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.warn("Scroll failed or timed out, proceeding anyway");
    }

    // 5. STATIC ANALYSIS
    const html = await page.content();
    const staticFindings = scanHtmlContent(html, detectedKeys);
    findings.push(...staticFindings);

    // 6. ANALYZE COOKIES
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

    // 7. Scoring logic
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
