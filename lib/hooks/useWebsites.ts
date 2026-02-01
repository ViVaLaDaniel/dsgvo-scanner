'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Website, UserProfile } from '@/types/supabase';

export function useWebsites() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [latestScans, setLatestScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [supabase] = useState(() => createClient());

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: profileData },
        { data: websitesData }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('id', user.id).single(),
        supabase.from('websites').select('*').order('created_at', { ascending: false })
      ]);

      if (profileData) setProfile(profileData);
      
      if (websitesData) {
        setWebsites(websitesData);
        
        const websiteIds = websitesData.map(w => w.id);
        if (websiteIds.length > 0) {
          const { data: scansData } = await supabase
            .from('scans')
            .select('*')
            .in('website_id', websiteIds)
            .order('created_at', { ascending: false });

          if (scansData) {
            // Group by website to get only the latest scan for each
            const latestMap = websitesData.map(w => {
              const scan = scansData.find(s => s.website_id === w.id);
              return scan ? { ...scan, website_id: w.id } : null;
            }).filter(Boolean);
            
            setLatestScans(latestMap);
          }
        }
      }
    } catch (err: any) {
      console.error('useWebsites Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [loadData]);

  const deleteWebsite = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('websites')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Optimistic update
      setWebsites(prev => prev.filter(w => w.id !== id));
      return true;
    } catch (err: any) {
      console.error('Delete error:', err);
      return false;
    }
  };

  return {
    websites,
    profile,
    latestScans,
    isLoading,
    error,
    refresh: () => loadData(),
    deleteWebsite
  };
}
