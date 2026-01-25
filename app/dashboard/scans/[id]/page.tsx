'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  ShieldAlert, 
  ShieldCheck, 
  ArrowLeft, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2,
  Info,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const MOCK_FINDINGS = [
  {
    category: 'Drittanbieter & CDNs',
    title: 'Google Fonts (Remote)',
    description: 'Schriftarten werden direkt von Google-Servern (fonts.googleapis.com) geladen. Dabei wird die IP-Adresse des Nutzers in die USA übertragen.',
    severity: 'High',
    recommendation: 'Laden Sie die Schriftarten herunter und hosten Sie diese lokal auf Ihrem eigenen Server.',
    impact: 'Abmahngefahr durch LG München I Urteil (Az. 3 O 191/22).'
  },
  {
    category: 'Maps & Medien',
    title: 'Google Maps Integration',
    description: 'Eine interaktive Karte von Google Maps wird geladen, bevor der Nutzer seine Einwilligung gegeben hat.',
    severity: 'Medium',
    recommendation: 'Implementieren Sie eine "Zwei-Klick-Lösung" oder binden Sie Karten erst nach expliziter Zustimmung im Consent-Banner ein.',
    impact: 'Unzulässiger Datentransfer in ein Drittland.'
  },
  {
    category: 'Tracking & Analytics',
    title: 'Google Tag Manager',
    description: 'GTM wird ohne vorherige Einwilligung des Nutzers geladen, was das Setzen von Tracking-Cookies ermöglichen kann.',
    severity: 'High',
    recommendation: 'Stellen Sie sicher, dass das GTM-Skript erst nach der Einwilligung im Cookie-Banner gefeuert wird.',
    impact: 'Verstoß gegen TDDDG & DSGVO.'
  },
  {
    category: 'Medien',
    title: 'YouTube Embeds',
    description: 'Eingebettete Videos laden Tracker von doubleclick.net, auch wenn das Video noch nicht abgespielt wurde.',
    severity: 'Low',
    recommendation: 'Nutzen Sie den "erweiterten Datenschutzmodus" (youtube-nocookie.com) oder binden Sie Videos erst nach Einwilligung ein.',
    impact: 'Zusätzliche Tracking-Cookies von Google.'
  }
];

export default function ScanResultPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scanData, setScanData] = useState<any>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<any | null>(null);
  const [branding, setBranding] = useState({
    logo_url: '',
    primary_color: '#2563eb',
    report_footer: 'Professionelles DSGVO-Monitoring'
  });

  useEffect(() => {
    // Load branding settings
    const savedBranding = sessionStorage.getItem('user-branding');
    if (savedBranding) {
      setBranding(JSON.parse(savedBranding));
    }

    // Simulate a "real" scan analysis
    async function performScan() {
      try {
        setLoading(true);
      
      const websites: any[] = []; // In production, this would be fetched from DB or passed as state
      const currentWebsite = websites.find((w: any) => w.id === params.id) || {
        url: 'https://vitbikes.de/store/reutlingen-28',
        client_name: 'Vitbikes Reutlingen'
      };

      const url = currentWebsite.url.toLowerCase();
      const detectedFindings = [];
      let score = 100;

      if (url.includes('vitbikes.de') || url.includes('google')) {
         detectedFindings.push({
            category: 'Drittanbieter & CDNs',
            title: 'Google Fonts (Remote)',
            description: 'Schriftarten werden direkt von Google-Servern (fonts.googleapis.com) geladen. Dabei wird die IP-Adresse des Nutzers in die USA übertragen.',
            severity: 'High',
            recommendation: 'Laden Sie die Schriftarten herunter und hosten Sie diese lokal auf Ihrem eigenen Server.',
            impact: 'Abmahngefahr durch LG München I Urteil (Az. 3 O 191/22).',
            solution: {
              steps: [
                'Besuchen Sie google-webfonts-helper.herokuapp.com.',
                'Suchen Sie nach den verwendeten Schriftarten.',
                'Wählen Sie die Zeichensätze (z.B. latin) und Stile aus.',
                'Laden Sie das ZIP-Archiv herunter и entpacken Sie es in Ihren `/public/fonts` Ordner.',
                'Kopieren Sie das generierte CSS in Ihre Stylesheet-Datei.'
              ],
              code: '@font-face {\n  font-family: "MyFont";\n  src: url("/fonts/myfont.woff2") format("woff2");\n  font-display: swap;\n}',
              tip: 'Nutzen Sie `font-display: swap`, um die Ladezeit der Seite nicht negativ zu beeinflussen.'
            }
         });
         score -= 15;
      }

      if (url.includes('vitbikes.de') || url.includes('googletagmanager')) {
        detectedFindings.push({
          category: 'Tracking & Analytics',
          title: 'Google Tag Manager',
          description: 'GTM wird ohne vorherige Einwilligung des Nutzers geladen, was das Setzen von Tracking-Cookies ermöglichen kann.',
          severity: 'High',
          recommendation: 'Stellen Sie sicher, dass das GTM-Skript erst nach der Einwilligung im Cookie-Banner gefeuert wird.',
          impact: 'Verstoß gegen TDDDG & DSGVO.',
          solution: {
            steps: [
              'Entfernen Sie das feste GTM-Skript aus dem `<head>` Bereich.',
              'Integrieren Sie eine Consent Management Platform (CMP).',
              'Konfigurieren Sie den GTM-Code so, dass er erst nach der Zustimmung (`analytics_storage` granted) geladen wird.',
              'Nutzen Sie den Google Consent Mode (v2).'
            ],
            code: 'window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag("consent", "default", {\n  "analytics_storage": "denied",\n  "ad_storage": "denied"\n});',
            tip: 'Testen Sie Ihre Implementierung mit dem GTM-Vorschaumedus, um sicherzustellen, dass keine Daten vorab fließen.'
          }
        });
        score -= 20;
      }

      if (url.includes('youtube.com') || url.includes('vitbikes.de')) {
        detectedFindings.push({
          category: 'Medien',
          title: 'YouTube Embeds',
          description: 'Eingebettete Videos laden Tracker von doubleclick.net, auch wenn das Video noch nicht abgespielt wurde.',
          severity: 'Medium',
          recommendation: 'Nutzen Sie den "erweiterten Datenschutzmodus" (youtube-nocookie.com) oder binden Sie Videos erst nach Einwilligung ein.',
          impact: 'Zusätzliche Tracking-Cookies von Google.',
          solution: {
            steps: [
              'Gehen Sie beim YouTube Video auf "Teilen" -> "Einbetten".',
              'Aktivieren Sie die Option "Erweiterten Datenschutzmodus aktivieren".',
              'Prüfen Sie, ob die URL nun `youtube-nocookie.com` enthält.',
              'Ersetzen Sie den alten Iframe-Code auf Ihrer Webseite.'
            ],
            code: '<iframe src="https://www.youtube-nocookie.com/embed/VIDEO_ID" ...></iframe>',
            tip: 'Für maximale Sicherheit nutzen Sie eine "Zwei-Klick-Lösung", die erst ein Vorschaubild anzeigt.'
          }
        });
        score -= 10;
      }

      if (detectedFindings.length === 0) {
        score = 98;
      }

      const finalData = {
        url: currentWebsite.url,
        client_name: currentWebsite.client_name,
        date: new Date().toLocaleDateString('de-DE'),
        score: score,
        status: score < 50 ? 'Kritisch' : score < 85 ? 'Warnung' : 'Sicher'
      };
      
      setScanData(finalData);
      setFindings(detectedFindings);

      // AUTO-SAVE to ensure score appears in list immediately
      const savedScans = JSON.parse(sessionStorage.getItem('dashboard-scans') || '[]');
      const newScanHistoryEntry = {
        id: params.id,
        name: finalData.client_name,
        url: finalData.url,
        date: finalData.date,
        status: finalData.status,
        violations: detectedFindings.length,
        score: finalData.score,
        risk: finalData.score < 50 ? 'high' : finalData.score < 85 ? 'warning' : 'safe'
      };
      const filteredScans = savedScans.filter((s: any) => s.id !== params.id);
      sessionStorage.setItem('dashboard-scans', JSON.stringify([newScanHistoryEntry, ...filteredScans]));
      
    } catch (err) {
      console.error('Scan analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

    performScan();
  }, [params.id]);

  const handleSaveReport = () => {
    // Persistent saving in mocked mode
    const savedScans = JSON.parse(sessionStorage.getItem('dashboard-scans') || '[]');
    
    // Add current scan to history
    const newScanEntry = {
      id: params.id,
      name: scanData?.client_name,
      url: scanData?.url,
      date: scanData?.date,
      status: scanData?.status,
      violations: findings.length,
      score: scanData?.score,
      risk: (scanData?.score ?? 0) < 50 ? 'high' : (scanData?.score ?? 0) < 85 ? 'warning' : 'safe'
    };

    // Prevent duplicates
    const filteredScans = savedScans.filter((s: any) => s.id !== params.id);
    sessionStorage.setItem('dashboard-scans', JSON.stringify([newScanEntry, ...filteredScans]));
    
    alert('Bericht erfolgreich im Dashboard gespeichert! ✅');
  };

  const handleShareReport = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link zum Bericht wurde in die Zwischenablage kopiert! 🔗');
  };

  if (loading || !scanData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse">Deep-Scan Analyse läuft...</p>
        </div>
      </div>
    );
  }

  // Use a stable reference for scanData to please the compiler and avoid race conditions
  const reportData = scanData;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative pb-20">
      {/* Print-Only Header with Logo */}
      <div className="print-only mb-12 border-b pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt="Logo" className="h-12 object-contain" />
            ) : (
              <>
                <div className="bg-blue-600 p-2 rounded-xl" style={{ backgroundColor: branding.primary_color }}>
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tighter">
                    DSGVO<span style={{ color: branding.primary_color }}>Scan</span>
                  </h1>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Technologiebericht & Analyse</p>
                </div>
              </>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900">{reportData?.date}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bericht ID: {params?.id}</p>
          </div>
        </div>
      </div>

      {/* Solution Overlay */}
      {selectedSolution && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSolution(null);
          }}
        >
          <Card className="w-full max-w-2xl shadow-2xl border-none animate-in zoom-in-95 duration-300">
            <CardHeader className="border-b bg-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="mb-2 border-blue-200 text-blue-600 font-bold uppercase text-[10px]">
                    Lösungsweg
                  </Badge>
                  <CardTitle className="text-2xl font-black text-slate-900">{selectedSolution.title}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedSolution(null)} className="rounded-full">
                  <ShieldCheck className="h-6 w-6 text-slate-400" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   Schritt-für-Schritt Anleitung
                </h4>
                <div className="space-y-3">
                  {selectedSolution.solution.steps.map((step: string, i: number) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                   Code-Beispiel
                </h4>
                <div className="bg-slate-900 rounded-xl p-6 text-blue-300 font-mono text-xs leading-relaxed relative group">
                  <pre className="whitespace-pre-wrap">{selectedSolution.solution.code}</pre>
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2 text-slate-500 hover:text-white" onClick={() => navigator.clipboard.writeText(selectedSolution.solution.code)}>
                    Copied
                  </Button>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 flex gap-4 items-start">
                 <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Info className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-amber-900">Pro-Tipp vom DSB</p>
                    <p className="text-sm text-amber-700 font-medium italic mt-1 leading-relaxed">"{selectedSolution.solution.tip}"</p>
                 </div>
              </div>
              
              <div className="pt-2 flex justify-end">
                 <Button onClick={() => setSelectedSolution(null)} className="bg-slate-900 hover:bg-slate-800 font-bold px-8">
                   Verstanden
                 </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Scan-Bericht</h2>
            <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
              <span>{reportData?.client_name}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-blue-600 truncate max-w-[300px]">
                {reportData?.url} <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="font-bold gap-2 no-print" onClick={handleSaveReport}>
            <ShieldCheck className="h-4 w-4" />
            Speichern
          </Button>
          <Button variant="outline" className="font-bold gap-2 no-print" onClick={() => window.print()}>
            <Download className="h-4 w-4" />
            PDF Export
          </Button>
          <Button 
            className="font-bold no-print text-white border-none shadow-lg" 
            style={{ backgroundColor: branding.primary_color }}
            onClick={handleShareReport}
          >
            Bericht teilen
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 overflow-hidden border-none shadow-xl shadow-slate-200/50 card">
          <div className={cn(
            "h-2 w-full",
            (reportData?.score ?? 0) < 50 ? "bg-red-500" : (reportData?.score ?? 0) < 85 ? "bg-amber-500" : "bg-green-500"
          )} />
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                  <circle
                    className="text-slate-100"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                  <circle
                    style={{ color: branding.primary_color }}
                    strokeWidth="8"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * (reportData?.score ?? 0)) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-4xl font-black text-slate-900">{reportData?.score}</span>
                  <span className="text-xs font-bold text-slate-400 block mt-[-4px]">/ 100</span>
                </div>
              </div>

              <div className="space-y-4">
                <Badge className={cn(
                  "font-black uppercase tracking-widest text-[10px] px-3 py-1",
                  (reportData?.score ?? 0) < 50 ? "bg-red-100 text-red-700 hover:bg-red-100" : 
                  (reportData?.score ?? 0) < 85 ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : 
                  "bg-green-100 text-green-700 hover:bg-green-100"
                )}>
                  Status: {reportData?.status}
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">
                  {(reportData?.score ?? 0) >= 90 ? 'Hervorragendes Ergebnis' : 'Verbesserungspotenzial erkannt'}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {findings.length > 0 
                    ? `Wir haben bei der Überprüfung von ${reportData?.url} ${findings.length} kritische Punkte gefunden. Bitte prüfen Sie die Details unten.`
                    : `Hervorragend! Wir konnten keine offensichtlichen DSGVO-Verstöße auf ${reportData?.url} feststellen.`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Quick Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm font-medium text-slate-400">Google Fonts</span>
              {reportData?.url?.toLowerCase().includes('vitbikes.de') || reportData?.url?.toLowerCase().includes('google') ? <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-none">GEFAHR</Badge> : <Badge className="bg-green-500/20 text-green-400 border-none">OK</Badge>}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm font-medium text-slate-400">Cookie Banner</span>
              <Badge className="bg-green-500/20 text-green-400 border-none uppercase text-[8px]">ERKANNT</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm font-medium text-slate-400">Datenschutzerklärung</span>
              <Badge className="bg-green-500/20 text-green-400 border-none uppercase text-[8px]">OK</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-slate-400">SSL Verschlüsselung</span>
              <Badge className="bg-green-500/20 text-green-400 border-none uppercase text-[8px]">AKTIV</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Findings List */}
      {findings.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
             Gefundene Schwachstellen
             <span className="text-slate-400 font-medium text-sm">({findings.length})</span>
          </h3>

          <div className="grid gap-6">
            {findings.map((finding, idx) => (
              <Card key={idx} className="group border-slate-200 transition-all hover:border-blue-200 hover:shadow-md card">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={cn(
                      "w-full md:w-48 p-6 flex flex-col items-center justify-center text-center gap-2 border-b md:border-b-0 md:border-r print:bg-slate-50",
                      finding.severity === 'High' ? "bg-red-50/50" : finding.severity === 'Medium' ? "bg-amber-50/50" : "bg-blue-50/50"
                    )}>
                      <div className={cn(
                        "p-3 rounded-2xl",
                        finding.severity === 'High' ? "bg-red-100 text-red-600" : finding.severity === 'Medium' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                      )}>
                        {finding.severity === 'High' ? <AlertCircle className="h-6 w-6" /> : finding.severity === 'Medium' ? <AlertCircle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        finding.severity === 'High' ? "text-red-600" : finding.severity === 'Medium' ? "text-amber-600" : "text-blue-600"
                      )}>
                        {finding.severity}-Risk
                      </span>
                    </div>
                    <div className="flex-1 p-6 md:p-8 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{finding.category}</p>
                          <h4 className="text-xl font-extrabold text-slate-900 leading-tight">{finding.title}</h4>
                        </div>
                        <Badge variant="outline" className="w-fit font-bold border-slate-200 text-slate-500 uppercase text-[10px]">
                          Web-Crawler 1.0 (PROTOTYPE)
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-2">Beschreibung</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{finding.description}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-slate-50">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-1.5 flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3 text-red-500" /> Auswirkung
                            </p>
                            <p className="text-xs text-slate-500 font-semibold">{finding.impact}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-2">Empfohlene Maßnahme</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{finding.recommendation}"</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full font-bold border-blue-100 text-blue-600 hover:bg-blue-50 h-10 no-print"
                            onClick={() => setSelectedSolution(finding)}
                          >
                            Lösung anzeigen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <Card className="bg-slate-50 border-dashed border-2 border-slate-200 card">
        <CardContent className="p-8 flex items-start gap-4">
          <div className="p-2 bg-blue-100 rounded-lg shrink-0">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-1 flex-1">
            <p className="text-sm font-bold text-slate-900">Haftungsausschluss</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Этот отчет был создан автоматически и служит для первоначальной ориентации. 
              {branding.report_footer && <span className="block mt-1 font-bold italic text-slate-700">{branding.report_footer}</span>}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
