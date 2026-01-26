import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { websiteId } = await req.json();

    if (!websiteId) {
      return NextResponse.json({ error: 'Website ID is required' }, { status: 400 });
    }

    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch website
    const { data: website, error: fetchError } = await supabase
      .from('websites')
      .select('*')
      .eq('id', websiteId)
      .eq('owner_id', user.id)
      .single();

    if (fetchError || !website) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    // 3. Mark scan as running (create scan record)
    const { data: scan, error: insertError } = await supabase
      .from('scans')
      .insert({
        website_id: websiteId,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create scan record' }, { status: 500 });
    }

    // 4. PERFORM SCAN (PROTOTYPE LOGIC)
    // In a real implementation, this would trigger a background job or use Puppeteer
    const url = website.url.toLowerCase();
    const detectedFindings = [];
    let score = 100;

    // Google Fonts
    if (url.includes('google') || url.includes('fonts.googleapis.com')) {
      detectedFindings.push({
        category: 'Drittanbieter & CDNs',
        title: 'Google Fonts (Remote)',
        status: 'violation',
        severity: 'high',
        description_de: 'Schriftarten werden direkt von Google-Servern geladen.',
        recommendation_de: 'Laden Sie die Schriftarten herunter und hosten Sie diese lokal.'
      });
      score -= 15;
    }

    // GTM
    if (url.includes('googletagmanager')) {
      detectedFindings.push({
        category: 'Tracking & Analytics',
        title: 'Google Tag Manager',
        status: 'violation',
        severity: 'high',
        description_de: 'GTM wird ohne Einwilligung geladen.',
        recommendation_de: 'Konfigurieren Sie GTM mit einer CMP.'
      });
      score -= 20;
    }

    if (detectedFindings.length === 0) {
      score = 98;
    }

    // 5. Update scan record
    const { error: updateError } = await supabase
      .from('scans')
      .update({
        status: 'completed',
        violations_count: detectedFindings.length,
        risk_score: score,
        results: { findings: detectedFindings },
        completed_at: new Date().toISOString()
      })
      .eq('id', scan.id);

    // 6. Update website last_scan_at
    await supabase
      .from('websites')
      .update({ last_scan_at: new Date().toISOString() })
      .eq('id', websiteId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update scan record' }, { status: 500 });
    }

    return NextResponse.json({
      scanId: scan.id,
      score,
      violations: detectedFindings.length
    });

  } catch (error) {
    console.error('Scan API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
