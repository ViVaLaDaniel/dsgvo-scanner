'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShieldAlert, 
  ArrowLeft, 
  ExternalLink, 
  AlertCircle, 
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useScanDetail } from '@/lib/hooks/useScanDetail';
import { DownloadReportButton } from '@/components/reporting/DownloadReportButton';
import { SendReportModal } from '@/components/reporting/SendReportModal';

export default function ScanResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { scan, website, agency, isLoading } = useScanDetail(id);
  const [selectedSolution, setSelectedSolution] = useState<any | null>(null);

  const [isCopied, setIsCopied] = useState(false);

  const handleShareReport = async () => {
    try {
      const url = window.location.href;
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  if (isLoading || !scan) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-slate-100 rounded-lg" />
          <div className="h-12 w-64 bg-slate-100 rounded" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 h-48 border-slate-100" />
          <Card className="h-48 border-slate-100" />
        </div>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-slate-100 rounded" />
          {[1, 2].map(i => <Card key={i} className="h-40 border-slate-100" />)}
        </div>
      </div>
    );
  }

  const findings = (scan.results as any)?.findings || [];
  const score = scan.risk_score || 0;
  const status = score < 50 ? 'Kritisch' : score < 85 ? 'Warnung' : 'Sicher';
  const brandColor = agency?.brand_color || '#2563eb';

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative pb-20">
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
                {selectedSolution.recommendation_de ? (
                  <p className="text-slate-600 font-medium leading-relaxed">{selectedSolution.recommendation_de}</p>
                ) : (
                  <p className="text-slate-400 italic">Keine detaillierte Anleitung verfügbar.</p>
                )}
              </div>

              <div className="bg-amber-50 rounded-xl p-6 border border-amber-100 flex gap-4 items-start">
                 <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <Info className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-amber-900">Pro-Tipp vom DSB</p>
                    <p className="text-sm text-amber-700 font-medium italic mt-1 leading-relaxed">
                      &quot;Stellen Sie sicher, dass alle externen Ressourcen lokal gehostet werden oder erst nach einer Einwilligung geladen werden.&quot;
                    </p>
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

      {/* Prototype Warning Notice */}
      <div className="no-print bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        <p className="text-sm font-medium">
          <span className="font-bold">Hinweis:</span> Dies ist ein Prototyp. Die Analyse basiert momentan auf vordefinierten Mustern. Eine vollständige technische Prüfung erfolgt in der finalen Version.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Scan-Bericht</h2>
            <div className="flex items-center gap-2 text-slate-500 font-medium mt-1">
              <span>{website?.client_name}</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-blue-600 truncate max-w-[300px]">
                {website?.url} <ExternalLink className="h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <DownloadReportButton scanId={id} className="font-bold" />
          <SendReportModal 
            scanId={id} 
            websiteUrl={website?.url || ''} 
            clientName={website?.client_name || 'Kunde'} 
          />
          <Button 
            className="font-bold no-print text-white border-none shadow-lg transition-all" 
            style={{ backgroundColor: isCopied ? '#059669' : brandColor }}
            onClick={handleShareReport}
          >
            {isCopied ? 'Gekopiert!' : 'Link kopieren'}
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 overflow-hidden border-none shadow-xl shadow-slate-200/50 card">
          <div className={cn(
            "h-2 w-full",
            score < 50 ? "bg-red-500" : score < 85 ? "bg-amber-500" : "bg-green-500"
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
                    style={{ color: brandColor }}
                    strokeWidth="8"
                    strokeDasharray={364}
                    strokeDashoffset={364 - (364 * score) / 100}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="58"
                    cx="64"
                    cy="64"
                  />
                </svg>
                <div className="text-center">
                  <span className="text-4xl font-black text-slate-900">{score}</span>
                  <span className="text-xs font-bold text-slate-400 block mt-[-4px]">/ 100</span>
                </div>
              </div>

              <div className="space-y-4">
                <Badge className={cn(
                  "font-black uppercase tracking-widest text-[10px] px-3 py-1",
                  score < 50 ? "bg-red-100 text-red-700 hover:bg-red-100" : 
                  score < 85 ? "bg-amber-100 text-amber-700 hover:bg-amber-100" : 
                  "bg-green-100 text-green-700 hover:bg-green-100"
                )}>
                  Status: {status}
                </Badge>
                <h3 className="text-2xl font-bold text-slate-900">
                  {score >= 90 ? 'Hervorragendes Ergebnis' : 'Verbesserungspotenzial erkannt'}
                </h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {findings.length > 0 
                    ? `Wir haben bei der Überprüfung ${findings.length} kritische Punkte gefunden. Bitte prüfen Sie die Details unten.`
                    : 'Hervorragend! Wir konnten keine offensichtlichen DSGVO-Verstöße feststellen.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 bg-slate-900 text-white card">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Service Check
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm font-medium text-slate-400">Google Fonts</span>
              {findings.some((f: any) => f.title?.includes('Font')) ? (
                <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-none">GEFAHR</Badge>
              ) : (
                <Badge className="bg-green-500/20 text-green-400 border-none">OK</Badge>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm font-medium text-slate-400">Tracker</span>
              {findings.some((f: any) => f.category === 'Tracking & Analytics') ? (
                <Badge variant="destructive" className="bg-amber-500/20 text-amber-400 border-none">AKTIV</Badge>
              ) : (
                <Badge className="bg-green-500/20 text-green-400 border-none">OK</Badge>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b border-white/10">
              <span className="text-sm font-medium text-slate-400">SSL Status</span>
              <Badge className="bg-green-500/20 text-green-400 border-none uppercase text-[8px]">GESICHERT</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-slate-400">Rechtstexte</span>
              <Badge className="bg-green-500/20 text-green-400 border-none uppercase text-[8px]">GEFUNDEN</Badge>
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
            {findings.map((finding: any, idx: number) => (
              <Card key={idx} className="group border-slate-200 transition-all hover:border-blue-200 hover:shadow-md card">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className={cn(
                      "w-full md:w-40 p-4 md:p-6 flex flex-row md:flex-col items-center justify-start md:justify-center text-left md:text-center gap-4 md:gap-2 border-b md:border-b-0 md:border-r",
                      finding.severity === 'high' ? "bg-red-50/50" : finding.severity === 'medium' ? "bg-amber-50/50" : "bg-blue-50/50"
                    )}>
                      <div className={cn(
                        "p-2 md:p-3 rounded-xl md:rounded-2xl",
                        finding.severity === 'high' ? "bg-red-100 text-red-600" : finding.severity === 'medium' ? "bg-amber-100 text-amber-600" : "bg-blue-100 text-blue-600"
                      )}>
                        <AlertCircle className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                      <div className="flex flex-col md:items-center">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          finding.severity === 'high' ? "text-red-600" : finding.severity === 'medium' ? "text-amber-600" : "text-blue-600"
                        )}>
                          {finding.severity}-Risk
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 p-6 md:p-8 space-y-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{finding.category}</p>
                          <h4 className="text-xl font-extrabold text-slate-900 leading-tight">{finding.title}</h4>
                        </div>
                        <Badge variant="outline" className="w-fit font-bold border-slate-200 text-slate-500 uppercase text-[10px]">
                          Smart-Check 2.0
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-2">Beschreibung</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed">{finding.description_de}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-1.5 flex items-center gap-1.5">
                              <AlertCircle className="h-3 w-3 text-red-500" /> Auswirkung
                            </p>
                            <p className="text-xs text-slate-500 font-semibold">{finding.impact_de || 'Datenschutzverstoß mit Abmahnrisiko.'}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="text-xs font-black text-slate-900 uppercase tracking-tighter mb-2">Empfohlene Maßnahme</p>
                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic">&quot;{finding.recommendation_de}&quot;</p>
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
            <p className="text-sm font-bold text-slate-900">Information</p>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Dieser Bericht wurde automatisiert erstellt und dient der ersten Orientierung. 
              Er ersetzt keine Rechtsberatung.
              {agency?.report_footer && <span className="block mt-1 font-bold italic text-slate-700">{agency.report_footer}</span>}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
