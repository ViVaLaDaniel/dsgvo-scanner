'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useDashboard() {
  const [stats, setStats] = useState({
    websitesCount: 0,
    websiteLimit: 10,
    criticalCount: 0,
    avgScore: 0
  });
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<{name: string, score: number}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: profile },
        { count: websitesCount },
        { data: scans }
      ] = await Promise.all([
        supabase.from('user_profiles').select('website_limit').eq('id', user.id).single(),
        supabase.from('websites').select('*', { count: 'exact', head: true }),
        supabase.from('scans')
          .select(`id, status, violations_count, created_at, risk_score, website:websites(client_name, url)`)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      const critical = scans?.filter(s => (s.risk_score || 0) < 50).length || 0;
      const totalScore = scans?.reduce((acc, s) => acc + (s.risk_score || 0), 0) || 0;
      const avg = scans && scans.length > 0 ? Math.round(totalScore / scans.length) : 100;

      setStats({
        websitesCount: websitesCount || 0,
        websiteLimit: profile?.website_limit || 10,
        criticalCount: critical,
        avgScore: avg
      });

      // Calculate Trend Data (Last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('de-DE', { weekday: 'short' });
      }).reverse();

      const trend = last7Days.map(day => {
        // In a real app, we'd filter scans by day. For now, we simulate or use existing scans.
        // We'll calculate a daily average or random walk for demo if no data exists.
        const dayScans = scans?.filter(s => new Date(s.created_at).toLocaleDateString('de-DE', { weekday: 'short' }) === day);
        const dayAvg = dayScans && dayScans.length > 0 
          ? Math.round(dayScans.reduce((a, b) => a + (b.risk_score || 0), 0) / dayScans.length)
          : avg; // Fallback to current avg
        
        return { name: day, score: dayAvg };
      });

      setTrendData(trend);

      if (scans) {
        setRecentScans(scans.slice(0, 5).map((s: any) => ({
          id: s.id,
          name: s.website?.client_name || 'Unbekannt',
          url: s.website?.url?.replace('https://', '')?.replace('http://', '') || '',
          date: new Date(s.created_at).toLocaleDateString('de-DE'),
          status: s.risk_score < 50 ? 'Kritisch' : s.risk_score < 85 ? 'Warnung' : 'Sicher',
          violations: s.violations_count,
          risk: s.risk_score < 50 ? 'high' : s.risk_score < 85 ? 'warning' : 'safe'
        })));
      }
    } catch (err) {
      console.error('useDashboard Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  return {
    stats,
    recentScans,
    trendData,
    isLoading,
    refresh: () => loadData()
  };
}
