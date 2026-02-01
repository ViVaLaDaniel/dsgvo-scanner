'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Scan, Website, Agency } from '@/types/supabase';

export function useScanDetail(scanId: string) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [website, setWebsite] = useState<Website | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: scanData } = await supabase
        .from('scans')
        .select('*, website:websites(*)')
        .eq('id', scanId)
        .single();

      if (scanData) {
        setScan(scanData);
        setWebsite(scanData.website as any);

        const ownerId = (scanData.website as any)?.owner_id;
        if (ownerId) {
          const { data: agencyData } = await supabase
            .from('agencies')
            .select('*')
            .eq('owner_id', ownerId)
            .single();
          if (agencyData) setAgency(agencyData);
        }
      }
    } catch (err) {
      console.error('useScanDetail loading error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [scanId, supabase]);

  useEffect(() => {
    if (scanId) loadData();
  }, [scanId, loadData]);

  return {
    scan,
    website,
    agency,
    isLoading,
    refresh: loadData
  };
}
