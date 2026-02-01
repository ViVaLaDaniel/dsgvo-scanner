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
        // Once we found the matching group for this hit, break inner loop
        break;
      }
    }
  }
  return newFindings;
}

export async function analyzeWebsite(url: string): Promise<ScanResult> {
  let score = 100;
  const findings: Finding[] = [];
  const detectedKeys = new Set<string>();

  let browser;
  try {
    // 1. Launch Browser
    // Note: In production (Vercel), we MUST use an external browser endpoint
    // because Vercel Serverless Functions do not include Chromium.
    const wsEndpoint = process.env.BROWSER_WSE_ENDPOINT;

    if (wsEndpoint) {
      browser = await chromium.connectOverCDP(wsEndpoint);
    } else {
      browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }

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

    // 3. Navigate and Wait (Optimized: 'load' is more reliable than 'networkidle')
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    } catch (e: any) {
      console.warn(`Navigation timeout or error for ${url}, attempting to proceed with partial content:`, e.message);
      // Even if it times out, we might have content we can scan
    }

    // 4. Auto-Scroll to trigger lazy-loaded requests (Optimized & Faster)
    try {
      await Promise.race([
        page.evaluate(async () => {
          await new Promise<void>((resolve) => {
            let totalHeight = 0;
            const distance = 400; // Increased distance
            const timer = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight || totalHeight > 15000) { // Safety cap at 15k pixels
                clearInterval(timer);
                resolve();
              }
            }, 50); // Faster interval
          });
        }),
        new Promise(resolve => setTimeout(resolve, 10000)) // 10s max for scrolling
      ]);
    } catch (e) {
      console.warn("Scroll failed or timed out, proceeding anyway");
    }

    // Wait a bit more for dynamic requests after scroll
    await page.waitForTimeout(2000);

    // 5. STATIC ANALYSIS (Optimized)
    // Scan the full HTML content for patterns that might not have triggered a network request
    // (e.g. blocked scripts, meta tags, css links)
    const html = await page.content();
    const staticFindings = scanHtmlContent(html, detectedKeys);
    findings.push(...staticFindings);

    // 6. ANALYZE COOKIES & STORAGE
    const cookies = await context.cookies();
    const localStorageData = await page.evaluate(() => JSON.stringify(window.localStorage));
    
    // Simple check: if cookies exist without a consent action being simulated, it's a potential warning
    if (cookies.length > 0) {
      findings.push({
        category: 'Cookies',
        title: 'Cookies vor Einwilligung erkannt',
        status: 'warning',
        severity: 'medium',
        description_de: `Es wurden ${cookies.length} Cookies erkannt, bevor der Nutzer seine Einwilligung gegeben hat.`,
        recommendation_de: 'Stellen Sie sicher, dass alle nicht notwendigen Cookies blockiert werden, bis eine ausdrückliche Einwilligung über das Cookie-Banner erfolgt.',
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
