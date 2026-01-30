'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { Website, Scan } from '@/types/supabase';
import Link from 'next/link';
import { useDashboard } from './dashboard-context';

export default function DashboardPage() {
  const { profile, websiteCount, user } = useDashboard();
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [supabase] = useState(() => createClient());
  const router = useRouter();

  useEffect(() => {
    async function loadRecentScans() {
      if (!user) return;

      // Only Load Recent Scans
      const { data: scans } = await supabase
        .from('scans')
        .select(`
          id,
          status,
          violations_count,
          created_at,
          website:websites(client_name, url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (scans) {
        setRecentScans(scans.map((s: any) => ({
          id: s.id,
          name: s.website?.client_name || 'Unbekannt',
          url: s.website?.url?.replace('https://', '')?.replace('http://', '') || '',
          date: new Date(s.created_at).toLocaleDateString('de-DE'),
          status: s.violations_count > 0 ? 'Kritisch' : 'Sicher',
          violations: s.violations_count,
          risk: s.violations_count > 0 ? 'high' : 'safe'
        })));
      }
    }

    loadRecentScans();
  }, [supabase, user]);

  const stats = {
    websitesCount: websiteCount || 0,
    websiteLimit: profile?.website_limit || 10,
    criticalCount: 0, // In production, calculate from DB
    avgScore: 92 // Placeholder
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">
            Willkommen zurück! Hier ist eine Übersicht Ihrer Mandanten.
          </p>
        </div>
        <Link href="/dashboard/websites">
          <Button className="font-bold shadow-lg shadow-blue-500/20 gap-2 h-11 px-6">
            <Plus className="h-4 w-4" />
            Neue Website
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Websites</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
               <Globe className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.websitesCount} / {stats.websiteLimit}</div>
            <p className="text-xs text-slate-400 mt-2 font-semibold">
              <span className="text-blue-600">Aktiv</span> в вашем плане
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Kritische Funde</CardTitle>
            <div className="p-2 bg-red-50 rounded-lg">
               <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-red-600">{stats.criticalCount}</div>
            <p className="text-xs text-slate-400 mt-2 font-semibold flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-green-600" />
              <span className="text-green-600">-0%</span> gegenüber Vorwoche
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">DSGVO Score</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
               <ShieldCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-900">{stats.avgScore}/100</div>
            <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 rounded-full" style={{ width: `${stats.avgScore}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Recent Activity & Critical Issues */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Scans Table */}
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Letzte Überprüfungen</CardTitle>
              <CardDescription className="text-slate-500 font-medium pt-1">Status Ihrer Mandanten-Websites</CardDescription>
            </div>
            <Link href="/dashboard/websites">
              <Button variant="ghost" className="text-blue-600 font-bold text-xs gap-1">
                Alle ansehen <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {recentScans.length === 0 ? (
                <div className="text-center py-10 text-slate-400 font-medium">
                  Noch keine Scans durchgeführt.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase tracking-tighter text-slate-400 font-bold border-b">
                    <tr>
                      <th className="pb-4 font-bold">Mandant / URL</th>
                      <th className="pb-4 font-bold">Datum</th>
                      <th className="pb-4 font-bold">Status</th>
                      <th className="pb-4 font-bold text-right">Fundstellen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentScans.map((item, idx) => (
                      <tr 
                        key={idx} 
                        onClick={() => item.id && router.push(`/dashboard/scans/${item.id}`)}
                        className="group hover:bg-slate-50 transition-all cursor-pointer border-transparent hover:border-l-4 hover:border-l-blue-600"
                      >
                        <td className="py-4">
                          <div className="font-bold text-slate-900 truncate max-w-[180px]">{item.name}</div>
                          <div className="text-slate-400 text-xs truncate max-w-[180px] flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
                            {item.url} <ExternalLink className="h-2.5 w-2.5" />
                          </div>
                        </td>
                        <td className="py-4 text-slate-500 font-semibold">{item.date}</td>
                        <td className="py-4">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm",
                            item.risk === 'high' ? "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20" :
                            item.risk === 'warning' ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20" :
                            "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                          )}>
                            {item.risk === 'safe' && <CheckCircle2 className="h-3 w-3" />}
                            {item.risk === 'high' && <AlertTriangle className="h-3 w-3" />}
                            {item.risk === 'warning' && <AlertTriangle className="h-3 w-3" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={cn(
                            "font-black text-lg",
                            item.violations > 0 ? "text-slate-900" : "text-green-600"
                          )}>{item.violations}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Critical Alerts Sidebar */}
        <Card className="shadow-sm border-slate-200 bg-slate-900 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full -mr-8 -mt-8 blur-3xl" />
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-400" />
              Sicherheits-Feed
            </CardTitle>
            <CardDescription className="text-slate-400">Aktuelle Abмаhn-Gefahren</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 group cursor-pointer hover:bg-white/10 transition-colors">
              <p className="text-xs font-bold text-blue-400">KRITISCH</p>
              <p className="text-sm font-bold leading-snug">Google Fonts: Welle von Abmahnungen in Österreich</p>
              <p className="text-[10px] text-slate-400 font-medium">Informieren Sie Ihre Mandanten</p>
            </div>
            
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
              <p className="text-xs font-bold text-amber-500">HINWEIS</p>
              <p className="text-sm font-bold leading-snug">Consent-Banner Fehler bei vielen Websites erkannt</p>
            </div>

            <Link href="/dashboard/websites" className="block w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold border-none h-11 shadow-lg shadow-blue-500/20">
                Details im Scanner ansehen
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}