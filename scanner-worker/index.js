require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const puppeteer = require('puppeteer');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

console.log('🚀 Scanner Worker Started via Supabase Realtime...');

async function scanWebsite(scanId, url) {
  console.log(`[${scanId}] Starting scan for: ${url}`);
  let browser = null;

  try {
    // Update status to running
    await supabase.from('scans').update({ status: 'running', started_at: new Date() }).eq('id', scanId);

    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Arrays to store findings
    const googleFonts = new Set();
    const thirdPartyRequests = new Set();

    // 1. Intercept Requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const reqUrl = request.url();

      if (reqUrl.includes('fonts.googleapis.com') || reqUrl.includes('fonts.gstatic.com')) {
        googleFonts.add(reqUrl);
      }

      if (reqUrl.includes('googletagmanager.com')) {
        thirdPartyRequests.add('Google Tag Manager');
      }

      if (reqUrl.includes('youtube.com') || reqUrl.includes('youtu.be')) {
        thirdPartyRequests.add('YouTube Embed');
      }

      request.continue();
    });

    // 2. Visit Page
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // 3. Check Cookies
    const cookies = await page.cookies();
    const analyticsCookies = cookies.filter(c => c.name.startsWith('_ga') || c.name.includes('ads'));

    // 4. Calculate Score & Construct Result
    let score = 100;
    const findings = {
      google_fonts: {
        status: googleFonts.size > 0 ? 'violation' : 'compliant',
        severity: 'high',
        description_de: googleFonts.size > 0
          ? `Es wurden ${googleFonts.size} Verbindungen zu Google Fonts Servern gefunden.`
          : 'Keine Google Fonts Verbindungen gefunden.',
        recommendation_de: 'Schriften lokal hosten.',
        technical_details: Array.from(googleFonts)
      },
      cookies: {
        status: analyticsCookies.length > 0 ? 'warning' : 'compliant',
        severity: 'medium',
        description_de: `Es wurden ${analyticsCookies.length} Tracking-Cookies gefunden.`,
        recommendation_de: 'Consent Banner prüfen.',
        technical_details: analyticsCookies.map(c => c.name)
      },
      third_party: {
         status: thirdPartyRequests.size > 0 ? 'violation' : 'compliant',
         severity: thirdPartyRequests.size > 0 ? 'medium' : 'low',
         description_de: `Gefundene Dienste: ${Array.from(thirdPartyRequests).join(', ')}`,
         recommendation_de: 'Dienste blockieren bis Einwilligung erteilt ist.'
      }
    };

    if (findings.google_fonts.status === 'violation') score -= 20;
    if (findings.cookies.status === 'warning') score -= 10;
    if (findings.third_party.status === 'violation') score -= 15;

    console.log(`[${scanId}] Finished. Score: ${score}`);

    // 5. Save Results
    const { error } = await supabase.from('scans').update({
      status: 'completed',
      violations_count: (googleFonts.size > 0 ? 1 : 0) + (analyticsCookies.length > 0 ? 1 : 0) + (thirdPartyRequests.size > 0 ? 1 : 0),
      risk_score: score,
      results: findings,
      completed_at: new Date()
    }).eq('id', scanId);

    if (error) console.error(`[${scanId}] Error saving results:`, error);

  } catch (err) {
    console.error(`[${scanId}] Scan failed:`, err);
    await supabase.from('scans').update({
      status: 'failed',
      error_log: err.message
    }).eq('id', scanId);
  } finally {
    if (browser) await browser.close();
  }
}

// Subscribe to new scans
supabase
  .channel('scans-channel')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'scans' },
    (payload) => {
      console.log('New scan received:', payload.new);
      if (payload.new.status === 'pending') {
        // Fetch URL from websites table
        supabase
          .from('websites')
          .select('url')
          .eq('id', payload.new.website_id)
          .single()
          .then(({ data, error }) => {
            if (data && data.url) {
               scanWebsite(payload.new.id, data.url);
            } else {
               console.error('Could not find website URL for scan', payload.new.id);
            }
          });
      }
    }
  )
  .subscribe();

// Optional: Poll for stuck 'pending' scans on startup
async function processPendingScans() {
    const { data: pendingScans } = await supabase
        .from('scans')
        .select('*, websites(url)')
        .eq('status', 'pending');

    if (pendingScans) {
        console.log(`Found ${pendingScans.length} pending scans on startup.`);
        for (const scan of pendingScans) {
            if (scan.websites && scan.websites.url) {
                scanWebsite(scan.id, scan.websites.url);
            }
        }
    }
}

processPendingScans();
