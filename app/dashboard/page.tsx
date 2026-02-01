'use client';

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
import Link from 'next/link';
import { DownloadReportButton } from '@/components/reporting/DownloadReportButton';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { RiskTrendChart } from '@/components/dashboard/RiskTrendChart';

export default function DashboardPage() {
  const router = useRouter();
  const { stats, recentScans, trendData, isLoading } = useDashboard();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
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
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse border-slate-200 h-32" />
          ))
        ) : (
          <>
            <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-blue-100 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Websites</CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform">
                   <Globe className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-slate-900">{stats.websitesCount} / {stats.websiteLimit}</div>
                <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className={cn(
                     "h-full rounded-full transition-all duration-1000",
                     (stats.websitesCount / stats.websiteLimit) > 0.9 ? "bg-red-500" : "bg-blue-600"
                   )} style={{ width: `${Math.min(100, (stats.websitesCount / stats.websiteLimit) * 100)}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-semibold">
                  <span className="text-blue-600">Aktiv</span> in Ihrem Plan
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-red-100 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">Kritische Funde</CardTitle>
                <div className="p-2 bg-red-50 rounded-lg group-hover:scale-110 transition-transform">
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

            <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md hover:border-green-100 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-widest">DSGVO Score</CardTitle>
                <div className="p-2 bg-green-50 rounded-lg group-hover:scale-110 transition-transform">
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
          </>
        )}
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
              {isLoading ? (
                <div className="space-y-4 py-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-16 w-full bg-slate-50 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : recentScans.length === 0 ? (
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
                      <th className="pb-4 font-bold text-center">Fundstellen</th>
                      <th className="pb-4 font-bold text-right">PDF</th>
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
                          <div className="font-bold text-slate-900 truncate max-w-[180px] group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.name}</div>
                          <div className="text-slate-400 text-xs truncate max-w-[180px] flex items-center gap-1.5 transition-colors">
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
                            {(item.risk === 'high' || item.risk === 'warning') && <AlertTriangle className="h-3 w-3" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className={cn(
                            "font-black text-lg",
                            item.violations > 0 ? "text-slate-900" : "text-green-600"
                          )}>{item.violations}</span>
                        </td>
                        <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <DownloadReportButton scanId={item.id} variant="ghost" className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Risk Analytics Chart */}
        <Card className="shadow-sm border-slate-200 lg:col-span-1 flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-blue-600" />
              Risiko-Entwicklung
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Durchschnittsscore (7 Tage)</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center pb-8">
            {isLoading ? (
              <div className="h-[200px] w-full bg-slate-50 animate-pulse rounded-2xl" />
            ) : (
              <RiskTrendChart data={trendData} />
            )}
            
            <div className="mt-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Status</p>
                  <p className="text-sm font-bold text-slate-900">
                    {stats.avgScore > 75 ? 'Hervorragend' : stats.avgScore > 50 ? 'Stabil' : 'Kritisch'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
