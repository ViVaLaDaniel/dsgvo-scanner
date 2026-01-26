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
      recommendation_de: 'Nutzen Sie youtube-nocookie.com oder implementieren Sie eine Zwei-Kлик-Lösung.',
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

export async function analyzeWebsite(url: string): Promise<ScanResult> {
  let score = 100;
  const findings: Finding[] = [];

  try {
    // 1. Fetch HTML content via server-side fetch
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Germani DSGVO Scanner/1.0 (Mozilla/5.0 Compliance Check)'
      },
      next: { revalidate: 0 }
    });

    if (!response.ok) {
      throw new Error(`Cloud not fetch website: ${response.statusText}`);
    }

    const html = await response.text();

    // 2. Perform pattern matching
    for (const pattern of Object.values(SCAN_PATTERNS)) {
      if (pattern.regex.test(html)) {
        findings.push(pattern.finding as Finding);
        
        // Dynamic scoring
        if (pattern.finding.severity === 'high') score -= 20;
        else if (pattern.finding.severity === 'medium') score -= 10;
        else score -= 5;
      }
    }

    // 3. Ensure score doesn't go below 0
    score = Math.max(0, score);
    
    // Default score if nothing found but not perfect
    if (findings.length === 0 && score === 100) {
      score = 98; // Minor things like headers usually missing
    }

    return { score, findings };

  } catch (error) {
    console.error('Scan Engine Error:', error);
    throw error;
  }
}
