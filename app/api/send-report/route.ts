import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { scanId, email, clientName, websiteUrl } = await req.json();

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_...') {
      return NextResponse.json({ error: 'Resend API Key ist nicht konfiguriert. Bitte in .env.local hinzufügen.' }, { status: 500 });
    }

    if (!scanId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch agency info for the sender
    const { data: agency } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    const reportLink = `${req.nextUrl.origin}/dashboard/scans/${scanId}`;
    const agencyName = agency?.name || 'DSGVO Scanner';

    const { data, error } = await resend.emails.send({
      from: 'DSGVO Scanner <onboarding@resend.dev>', // В продакшене заменить на домен агентства
      to: email,
      subject: `DSGVO Analyse-Bericht: ${websiteUrl}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 12px;">
          <h2 style="color: #0f172a;">Guten Tag ${clientName || 'заказчик'},</h2>
          <p style="color: #475569; line-height: 1.6;">
            Ihre DSGVO-Prüfung für die Website <strong>${websiteUrl}</strong> wurde erfolgreich abgeschlossen.
          </p>
          <p style="color: #475569; line-height: 1.6;">
            Wir haben eine detaillierte Analyse der technischen Verstöße (Google Fonts, Tracker, Cookies) durchgeführt. 
            Sie können den vollständigen interaktiven Bericht über den folgenden Link einsehen:
          </p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${reportLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Bericht online ansehen
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #94a3b8; font-size: 12px;">
            Mit freundlichen Grüßen,<br />
            <strong>${agencyName}</strong>
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Send Report Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
