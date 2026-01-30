import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeWebsite } from '@/lib/scan-engine';

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

    // 4. PERFORM REAL SCAN
    let scanResult;
    try {
      scanResult = await analyzeWebsite(website.url);
    } catch (scanError: any) {
      console.error('Core Scan Error:', scanError);
      await supabase
        .from('scans')
        .update({ 
          status: 'failed', 
          error_log: scanError.message || 'Analysis failed' 
        })
        .eq('id', scan.id);
      
      return NextResponse.json({ error: 'Analysis failed: ' + scanError.message }, { status: 500 });
    }

    // 5. Update scan record & 6. Update website last_scan_at (PARALLEL)
    const [{ error: updateError }] = await Promise.all([
      supabase
        .from('scans')
        .update({
          status: 'completed',
          violations_count: scanResult.findings.length,
          risk_score: scanResult.score,
          results: { findings: scanResult.findings },
          completed_at: new Date().toISOString()
        })
        .eq('id', scan.id),

      supabase
        .from('websites')
        .update({ last_scan_at: new Date().toISOString() })
        .eq('id', websiteId)
    ]);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update scan record' }, { status: 500 });
    }

    return NextResponse.json({
      scanId: scan.id,
      score: scanResult.score,
      violations: scanResult.findings.length
    });

  } catch (error) {
    console.error('Scan API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
