# 🔬 SCANNER ENGINE - ТЕХНИЧЕСКАЯ СПЕЦИФИКАЦИЯ

**Версия:** 1.0  
**Дата:** 31 января 2026  
**Статус:** Specification для разработки

---

## 🎯 ЦЕЛЬ

Создать backend scanning engine, который анализирует веб-сайты на соответствие DSGVO (GDPR) и выявляет технические нарушения.

---

## 🏗 АРХИТЕКТУРА

### High-Level Architecture:
```
┌─────────────┐
│   Next.js   │ (Frontend)
│   Client    │
└──────┬──────┘
       │ POST /api/scan
       ▼
┌─────────────────────────────────┐
│   API Layer (Next.js Route)     │
│   - Auth check                  │
│   - Rate limiting               │
│   - Job queue creation          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   Queue System (BullMQ + Redis) │
│   - Job scheduling              │
│   - Retry logic                 │
│   - Priority handling           │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   Scanner Worker                │
│   ┌─────────────────────────┐  │
│   │  Puppeteer/Playwright   │  │
│   │  Headless Browser       │  │
│   └───────────┬─────────────┘  │
│               ▼                 │
│   ┌─────────────────────────┐  │
│   │  Network Interceptor    │  │
│   │  - Capture requests     │  │
│   │  - Analyze cookies      │  │
│   │  - Track 3rd party      │  │
│   └───────────┬─────────────┘  │
│               ▼                 │
│   ┌─────────────────────────┐  │
│   │  DOM Analyzer           │  │
│   │  - Find scripts         │  │
│   │  - Detect iframes       │  │
│   │  - Check consent        │  │
│   └───────────┬─────────────┘  │
│               ▼                 │
│   ┌─────────────────────────┐  │
│   │  Rules Engine           │  │
│   │  - Apply DSGVO rules    │  │
│   │  - Calculate score      │  │
│   │  - Generate report      │  │
│   └───────────┬─────────────┘  │
└───────────────┼─────────────────┘
                ▼
┌─────────────────────────────────┐
│   Supabase Database             │
│   - Store scan results          │
│   - Cache known violations      │
│   - Track scan history          │
└─────────────────────────────────┘
```

---

## 📦 ТЕХНОЛОГИЧЕСКИЙ СТЕК

### Backend:
- **Runtime:** Node.js 20+
- **Framework:** Next.js API Routes
- **Headless Browser:** Playwright (более стабильный чем Puppeteer)
- **Queue:** BullMQ + Redis (для async processing)
- **Database:** Supabase PostgreSQL
- **Types:** TypeScript strict mode

### Зависимости:
```json
{
  "dependencies": {
    "playwright": "^1.40.0",
    "bullmq": "^5.0.0",
    "ioredis": "^5.3.2",
    "zod": "^3.22.4",
    "@supabase/supabase-js": "^2.39.0"
  }
}
```

---

## 🔌 API ENDPOINTS

### 1. POST /api/scan/create
**Описание:** Создает новую задачу сканирования

**Request:**
```typescript
interface ScanRequest {
  url: string;              // URL для сканирования
  mandantId: string;        // ID мандата
  scanType: 'quick' | 'deep'; // Тип сканирования
  options?: {
    checkConsent?: boolean; // Проверять cookie consent
    followRedirects?: boolean;
    timeout?: number;       // в секундах, default 30
  };
}
```

**Response:**
```typescript
interface ScanResponse {
  scanId: string;           // UUID задачи
  status: 'queued' | 'processing' | 'completed' | 'failed';
  queuePosition?: number;   // Позиция в очереди
  estimatedTime?: number;   // Оценка времени в секундах
  createdAt: string;        // ISO timestamp
}
```

**Пример:**
```bash
curl -X POST https://your-app.com/api/scan/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.de",
    "mandantId": "uuid-123",
    "scanType": "quick"
  }'
```

---

### 2. GET /api/scan/[scanId]/status
**Описание:** Получить статус сканирования

**Response:**
```typescript
interface ScanStatus {
  scanId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;        // 0-100%
  currentStep?: string;     // "Loading page", "Analyzing cookies", etc.
  result?: ScanResult;      // Только если status = completed
  error?: string;           // Только если status = failed
  updatedAt: string;
}
```

---

### 3. GET /api/scan/[scanId]/result
**Описание:** Получить результаты сканирования

**Response:**
```typescript
interface ScanResult {
  scanId: string;
  url: string;
  scannedAt: string;
  score: number;            // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  violations: Violation[];
  statistics: {
    totalRequests: number;
    thirdPartyRequests: number;
    cookiesSet: number;
    scriptsLoaded: number;
    iframesFound: number;
  };
  recommendations: Recommendation[];
}

interface Violation {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'cookies' | 'third-party' | 'consent' | 'tracking';
  title: string;
  description: string;
  detectedAt: string;       // Timestamp
  evidence: {
    type: 'request' | 'cookie' | 'script' | 'iframe';
    url?: string;
    name?: string;
    value?: string;
    domain?: string;
  };
  fix: {
    title: string;
    steps: string[];
    codeExample?: string;
  };
}

interface Recommendation {
  priority: number;         // 1-10
  title: string;
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
}
```

---

## 🔍 SCANNING PROCESS (Детальный Flow)

### Step 1: Page Load (10-15s)
```typescript
async function loadPage(url: string, options: ScanOptions) {
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'DSGVO-Scanner/1.0 (+https://dsgvo-scanner.com)',
    locale: 'de-DE',
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Enable request interception
  await page.route('**/*', async (route) => {
    const request = route.request();
    // Log all requests для анализа
    await logRequest(request);
    await route.continue();
  });
  
  // Enable response interception
  page.on('response', async (response) => {
    await analyzeResponse(response);
  });
  
  // Load page with timeout
  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: options.timeout || 30000
    });
  } catch (error) {
    throw new ScanError('PAGE_LOAD_TIMEOUT', error);
  }
  
  return { page, browser };
}
```

---

### Step 2: Network Analysis (5-10s)
```typescript
interface NetworkRequest {
  url: string;
  method: string;
  resourceType: string;
  initiator: string;
  headers: Record<string, string>;
  cookies: Cookie[];
  thirdParty: boolean;
  blocked: boolean;
}

async function analyzeNetworkTraffic(
  requests: NetworkRequest[]
): Promise<NetworkAnalysis> {
  const thirdPartyDomains = extractThirdPartyDomains(requests);
  const trackingRequests = requests.filter(isTrackingRequest);
  const cookiesSet = extractCookiesFromRequests(requests);
  
  return {
    totalRequests: requests.length,
    thirdPartyRequests: thirdPartyDomains.length,
    trackingRequests: trackingRequests.length,
    cookiesSet: cookiesSet.length,
    violations: detectNetworkViolations(requests)
  };
}

function isTrackingRequest(request: NetworkRequest): boolean {
  const trackingDomains = [
    'google-analytics.com',
    'googletagmanager.com',
    'facebook.com',
    'doubleclick.net',
    'analytics.google.com',
    // ... more from TRACKING_DOMAINS.json
  ];
  
  return trackingDomains.some(domain => 
    request.url.includes(domain)
  );
}
```

---

### Step 3: Cookie Analysis (3-5s)
```typescript
interface Cookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'Strict' | 'Lax' | 'None';
}

async function analyzeCookies(
  page: Page
): Promise<CookieAnalysis> {
  const cookies = await page.context().cookies();
  
  const violations: Violation[] = [];
  
  for (const cookie of cookies) {
    // Check if cookie is third-party
    if (isThirdPartyCookie(cookie, page.url())) {
      violations.push({
        id: `cookie-${cookie.name}`,
        severity: 'high',
        category: 'cookies',
        title: `Third-Party Cookie ohne Consent: ${cookie.name}`,
        description: `Cookie von ${cookie.domain} wird gesetzt ohne Einwilligung`,
        evidence: {
          type: 'cookie',
          name: cookie.name,
          domain: cookie.domain,
          value: cookie.value.substring(0, 50) + '...'
        },
        fix: {
          title: 'Cookie Consent implementieren',
          steps: [
            'Cookie Consent Manager installieren (z.B. Cookiebot)',
            'Cookie erst nach Einwilligung setzen',
            'Cookie-Banner DSGVO-konform gestalten'
          ],
          codeExample: `
// Beispiel: Cookie nur nach Consent setzen
if (userGaveConsent()) {
  document.cookie = "${cookie.name}=${cookie.value}";
}
          `
        }
      });
    }
    
    // Check if cookie is tracking cookie
    if (isTrackingCookie(cookie)) {
      violations.push({
        id: `tracking-${cookie.name}`,
        severity: 'critical',
        category: 'tracking',
        title: `Tracking-Cookie ohne Einwilligung: ${cookie.name}`,
        description: `Tracking-Cookie verstößt gegen Art. 6 Abs. 1 DSGVO`,
        // ... similar structure
      });
    }
  }
  
  return {
    totalCookies: cookies.length,
    thirdPartyCookies: cookies.filter(isThirdPartyCookie).length,
    trackingCookies: cookies.filter(isTrackingCookie).length,
    violations
  };
}
```

---

### Step 4: DOM Analysis (5-10s)
```typescript
async function analyzeDOM(page: Page): Promise<DOMAnalysis> {
  const violations: Violation[] = [];
  
  // Check for Google Fonts without self-hosting
  const googleFonts = await page.$$eval(
    'link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]',
    (links) => links.map(link => link.getAttribute('href'))
  );
  
  if (googleFonts.length > 0) {
    violations.push({
      id: 'google-fonts-external',
      severity: 'high',
      category: 'third-party',
      title: 'Google Fonts nicht lokal gehostet',
      description: 'Google Fonts werden von Google Servern geladen, IP-Adresse wird übertragen',
      evidence: {
        type: 'script',
        url: googleFonts[0]
      },
      fix: {
        title: 'Google Fonts lokal hosten',
        steps: [
          '1. Fonts herunterladen von https://google-webfonts-helper.herokuapp.com',
          '2. Fonts in /public/fonts/ speichern',
          '3. @font-face in CSS definieren'
        ],
        codeExample: `
@font-face {
  font-family: 'Roboto';
  src: url('/fonts/roboto-regular.woff2') format('woff2');
}
        `
      }
    });
  }
  
  // Check for YouTube embeds without consent
  const youtubeEmbeds = await page.$$('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
  if (youtubeEmbeds.length > 0) {
    violations.push({
      id: 'youtube-embed-no-consent',
      severity: 'critical',
      category: 'third-party',
      title: `${youtubeEmbeds.length} YouTube Embed(s) ohne Consent`,
      description: 'YouTube Embeds setzen Tracking-Cookies ohne Einwilligung',
      evidence: {
        type: 'iframe',
        url: await youtubeEmbeds[0].getAttribute('src')
      },
      fix: {
        title: 'YouTube Embeds mit Consent laden',
        steps: [
          '1. Nutze youtube-nocookie.com Domain',
          '2. Implementiere 2-Click-Lösung',
          '3. Zeige Placeholder vor Consent'
        ],
        codeExample: `
<!-- Statt: -->
<iframe src="https://www.youtube.com/embed/VIDEO_ID"></iframe>

<!-- Nutze: -->
<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID"></iframe>
        `
      }
    });
  }
  
  // Check for Google Tag Manager without consent
  const gtmScripts = await page.$$('script[src*="googletagmanager.com"]');
  if (gtmScripts.length > 0) {
    violations.push({
      id: 'gtm-no-consent',
      severity: 'critical',
      category: 'tracking',
      title: 'Google Tag Manager ohne Consent',
      description: 'GTM wird ohne vorherige Einwilligung geladen',
      // ... similar structure
    });
  }
  
  // Check for Facebook Pixel
  const fbPixel = await page.evaluate(() => {
    return window.fbq !== undefined;
  });
  
  if (fbPixel) {
    violations.push({
      id: 'facebook-pixel',
      severity: 'critical',
      category: 'tracking',
      title: 'Facebook Pixel ohne Consent',
      description: 'Meta Pixel trackt Nutzer ohne Einwilligung',
      // ...
    });
  }
  
  return {
    totalScripts: await page.$$('script').length,
    externalScripts: await page.$$('script[src]').length,
    iframes: await page.$$('iframe').length,
    violations
  };
}
```

---

### Step 5: Consent Detection (2-3s)
```typescript
interface ConsentDetection {
  hasConsentBanner: boolean;
  consentProvider?: string; // 'cookiebot', 'onetrust', 'custom', etc.
  isCompliant: boolean;
  issues: string[];
}

async function detectConsent(page: Page): Promise<ConsentDetection> {
  // Check for common consent banners
  const consentSelectors = [
    '#CybotCookiebotDialog',           // Cookiebot
    '.onetrust-banner-sdk',            // OneTrust
    '.cky-consent-container',          // CookieYes
    '[class*="cookie-banner"]',
    '[id*="cookie-consent"]'
  ];
  
  let hasConsentBanner = false;
  let consentProvider = undefined;
  
  for (const selector of consentSelectors) {
    const element = await page.$(selector);
    if (element) {
      hasConsentBanner = true;
      consentProvider = detectProvider(selector);
      break;
    }
  }
  
  const issues: string[] = [];
  
  if (!hasConsentBanner) {
    issues.push('Kein Cookie-Banner gefunden');
  } else {
    // Check if banner is DSGVO-compliant
    const hasRejectButton = await page.$('[data-action="reject"], button:has-text("Ablehnen")');
    if (!hasRejectButton) {
      issues.push('Kein "Ablehnen"-Button im Cookie-Banner');
    }
    
    const hasImpressum = await page.$('a[href*="impressum"], a:has-text("Impressum")');
    if (!hasImpressum) {
      issues.push('Kein Link zum Impressum gefunden');
    }
    
    const hasDatenschutz = await page.$('a[href*="datenschutz"], a:has-text("Datenschutz")');
    if (!hasDatenschutz) {
      issues.push('Kein Link zur Datenschutzerklärung gefunden');
    }
  }
  
  return {
    hasConsentBanner,
    consentProvider,
    isCompliant: issues.length === 0,
    issues
  };
}
```

---

### Step 6: Score Calculation (1s)
```typescript
interface ScoreWeights {
  cookies: number;          // 30%
  thirdParty: number;       // 25%
  consent: number;          // 25%
  tracking: number;         // 20%
}

function calculateScore(
  violations: Violation[],
  consentDetection: ConsentDetection
): number {
  let score = 100;
  
  // Deduct points based on violations
  for (const violation of violations) {
    switch (violation.severity) {
      case 'critical':
        score -= 15;
        break;
      case 'high':
        score -= 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'low':
        score -= 2;
        break;
    }
  }
  
  // Bonus for having consent banner
  if (consentDetection.hasConsentBanner) {
    score += 10;
  }
  
  // Bonus for compliant consent
  if (consentDetection.isCompliant) {
    score += 10;
  }
  
  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score));
}

function calculateGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}
```

---

## 📋 DSGVO RULES ENGINE

### Rules Configuration (JSON):
```json
{
  "rules": [
    {
      "id": "google-fonts-external",
      "name": "Google Fonts extern gehostet",
      "category": "third-party",
      "severity": "high",
      "description": "Google Fonts werden von Google Servern geladen",
      "legal_basis": "Art. 6 Abs. 1 DSGVO, EuGH C-101/21",
      "detection": {
        "type": "dom",
        "selector": "link[href*='fonts.googleapis.com']"
      },
      "fix": {
        "title": "Fonts lokal hosten",
        "effort": "medium",
        "steps": ["Download fonts", "Add to /public", "Update CSS"]
      }
    },
    {
      "id": "youtube-embed-tracking",
      "name": "YouTube Embed mit Tracking",
      "category": "tracking",
      "severity": "critical",
      "description": "YouTube setzt Tracking-Cookies ohne Consent",
      "legal_basis": "Art. 6 Abs. 1 lit. a DSGVO",
      "detection": {
        "type": "dom",
        "selector": "iframe[src*='youtube.com/embed']"
      },
      "fix": {
        "title": "Nutze youtube-nocookie.com",
        "effort": "low",
        "steps": ["Change domain to youtube-nocookie.com"]
      }
    }
    // ... more rules
  ]
}
```

---

## 🚀 PERFORMANCE OPTIMIZATION

### 1. Caching Strategy:
```typescript
// Cache known violations by domain
interface CacheEntry {
  domain: string;
  knownViolations: Violation[];
  lastChecked: Date;
  ttl: number; // Time to live in seconds
}

async function checkCache(url: string): Promise<CacheEntry | null> {
  const domain = new URL(url).hostname;
  const cached = await redis.get(`scan:${domain}`);
  
  if (cached) {
    const entry: CacheEntry = JSON.parse(cached);
    if (Date.now() - entry.lastChecked.getTime() < entry.ttl * 1000) {
      return entry;
    }
  }
  
  return null;
}
```

### 2. Parallel Processing:
```typescript
async function scanWebsite(url: string): Promise<ScanResult> {
  const { page, browser } = await loadPage(url);
  
  // Run analyses in parallel
  const [networkAnalysis, cookieAnalysis, domAnalysis, consentDetection] = 
    await Promise.all([
      analyzeNetworkTraffic(page),
      analyzeCookies(page),
      analyzeDOM(page),
      detectConsent(page)
    ]);
  
  await browser.close();
  
  // Combine results
  return combineResults(networkAnalysis, cookieAnalysis, domAnalysis, consentDetection);
}
```

### 3. Resource Limits:
```typescript
// Limit concurrent scans
const MAX_CONCURRENT_SCANS = 5;
const scanSemaphore = new Semaphore(MAX_CONCURRENT_SCANS);

async function processScanJob(job: Job<ScanRequest>) {
  await scanSemaphore.acquire();
  
  try {
    const result = await scanWebsite(job.data.url);
    return result;
  } finally {
    scanSemaphore.release();
  }
}
```

---

## 🔒 SECURITY CONSIDERATIONS

### 1. URL Validation:
```typescript
function validateScanUrl(url: string): void {
  const parsed = new URL(url);
  
  // Only allow http/https
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Invalid protocol');
  }
  
  // Block internal/private IPs
  const hostname = parsed.hostname;
  if (
    hostname === 'localhost' ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.')
  ) {
    throw new Error('Cannot scan internal networks');
  }
  
  // Block scanning of competitors (optional)
  const blockedDomains = ['competitor.com'];
  if (blockedDomains.some(d => hostname.includes(d))) {
    throw new Error('Domain is blocked');
  }
}
```

### 2. Rate Limiting:
```typescript
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 scans per hour
});

async function checkRateLimit(userId: string): Promise<boolean> {
  const { success } = await ratelimit.limit(userId);
  return success;
}
```

### 3. Timeout & Resource Management:
```typescript
// Kill hung scans
const SCAN_TIMEOUT = 60 * 1000; // 60 seconds

async function scanWithTimeout(url: string): Promise<ScanResult> {
  return Promise.race([
    scanWebsite(url),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Scan timeout')), SCAN_TIMEOUT)
    )
  ]);
}
```

---

## 📊 MONITORING & LOGGING

### 1. Metrics to Track:
```typescript
interface ScanMetrics {
  totalScans: number;
  averageScanTime: number;
  failureRate: number;
  cacheHitRate: number;
  violationsPerScan: number;
}

async function recordMetrics(scanResult: ScanResult, duration: number) {
  await analytics.track('scan_completed', {
    scanId: scanResult.scanId,
    duration,
    score: scanResult.score,
    violationsCount: scanResult.violations.length,
    url: scanResult.url
  });
}
```

### 2. Error Handling:
```typescript
class ScanError extends Error {
  constructor(
    public code: string,
    public details: any
  ) {
    super(`Scan failed: ${code}`);
  }
}

async function handleScanError(error: ScanError, job: Job) {
  // Log to Sentry
  Sentry.captureException(error, {
    extra: {
      jobId: job.id,
      url: job.data.url
    }
  });
  
  // Update job status
  await job.updateProgress({
    status: 'failed',
    error: error.message
  });
  
  // Notify user (if configured)
  if (job.data.notifyOnFailure) {
    await sendEmail({
      to: job.data.userEmail,
      subject: 'Scan fehlgeschlagen',
      body: `Scan von ${job.data.url} ist fehlgeschlagen: ${error.message}`
    });
  }
}
```

---

## 🧪 TESTING STRATEGY

### 1. Unit Tests:
```typescript
describe('Cookie Analysis', () => {
  it('should detect third-party cookies', () => {
    const cookie: Cookie = {
      name: '_ga',
      domain: '.google-analytics.com',
      // ...
    };
    
    expect(isThirdPartyCookie(cookie, 'https://example.com')).toBe(true);
  });
  
  it('should identify tracking cookies', () => {
    const cookie: Cookie = {
      name: '_fbp',
      domain: '.facebook.com',
      // ...
    };
    
    expect(isTrackingCookie(cookie)).toBe(true);
  });
});
```

### 2. Integration Tests:
```typescript
describe('Scan API', () => {
  it('should scan a website and return results', async () => {
    const response = await fetch('/api/scan/create', {
      method: 'POST',
      body: JSON.stringify({
        url: 'https://test-website.com',
        mandantId: 'test-123',
        scanType: 'quick'
      })
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('scanId');
  }, 60000); // 60s timeout
});
```

### 3. E2E Tests:
```typescript
// Use Playwright for E2E
test('full scan workflow', async ({ page }) => {
  await page.goto('/dashboard');
  await page.click('text=New Scan');
  await page.fill('input[name="url"]', 'https://example.com');
  await page.click('button:text("Start Scan")');
  
  // Wait for results
  await page.waitForSelector('.scan-results', { timeout: 60000 });
  
  // Verify results
  const score = await page.textContent('.score');
  expect(parseInt(score)).toBeGreaterThan(0);
});
```

---

## 📦 DEPLOYMENT

### Docker Configuration:
```dockerfile
# Dockerfile
FROM node:20-alpine

# Install Playwright dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables:
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

REDIS_URL=redis://localhost:6379

SENTRY_DSN=your-sentry-dsn

MAX_CONCURRENT_SCANS=5
SCAN_TIMEOUT_MS=60000

NODE_ENV=production
```

---

## 💰 COST ESTIMATION

### Infrastructure Costs (monthly):
- **Vercel Pro:** €20/month (для API routes)
- **Supabase Pro:** €25/month (для PostgreSQL)
- **Upstash Redis:** €10/month (для queue)
- **Playwright Browser:** €0 (self-hosted)
- **Sentry:** €0 (free tier для начала)

**Total:** €55/месяц

### Scaling Costs:
- При 1,000 scans/месяц: €55
- При 10,000 scans/месяц: €120 (нужен больший Redis)
- При 50,000 scans/месяц: €300+ (нужен dedicated worker)

---

## ✅ ACCEPTANCE CRITERIA

Scanning Engine считается готовым, если:

1. ✅ Сканирует 95%+ websites без ошибок
2. ✅ Average scan time < 30 секунд
3. ✅ Детектирует минимум 10 типов DSGVO violations
4. ✅ False positive rate < 5%
5. ✅ API uptime > 99.5%
6. ✅ Test coverage > 80%
7. ✅ Documentation complete
8. ✅ Security audit passed (OWASP checklist)

---

## 🎯 MILESTONES

### Week 1: Core Infrastructure
- [ ] Setup BullMQ + Redis
- [ ] Create API endpoints
- [ ] Implement basic Playwright integration

### Week 2: Detection Logic
- [ ] Network traffic analysis
- [ ] Cookie detection
- [ ] DOM analysis
- [ ] Consent detection

### Week 3: Rules Engine
- [ ] Implement DSGVO rules
- [ ] Score calculation
- [ ] Recommendations generation

### Week 4: Testing & Polish
- [ ] Write unit tests
- [ ] Integration tests
- [ ] Performance optimization
- [ ] Documentation

---

## 📞 QUESTIONS & DECISIONS NEEDED

1. **Queue System:** BullMQ + Redis vs AWS SQS?
   - **Recommendation:** BullMQ (cheaper, easier для MVP)

2. **Headless Browser:** Playwright vs Puppeteer?
   - **Recommendation:** Playwright (более стабильный)

3. **Hosting:** Vercel vs самостоятельный Docker?
   - **Recommendation:** Vercel для начала, Docker потом

4. **Database:** Separate Redis cache vs Supabase только?
   - **Recommendation:** Нужен Redis для queue

---

**Готов к разработке! 🚀**

Следующий шаг: Найти фрилансера на Upwork/Fiverr с этой спецификацией.
