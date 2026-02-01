
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ScanResultsClient from './ScanResultsClient';
import { Scan, Website, Agency } from '@/types/supabase';

// Helper type for the joined query result
type ScanWithWebsite = Scan & { website: Website };

export default async function ScanResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Scan and Website
  const { data: scanData, error: scanError } = await supabase
    .from('scans')
    .select('*, website:websites(*)')
    .eq('id', id)
    .single();

  if (scanError || !scanData) {
    console.error('Error fetching scan:', scanError);
    notFound();
  }

  const scan = scanData as unknown as ScanWithWebsite;
  const website = scan.website;
  let agency: Agency | null = null;

  // 2. Fetch Agency if owner exists
  // We use the owner_id from the website associated with the scan
  const ownerId = website?.owner_id;

  if (ownerId) {
    const { data: agencyData } = await supabase
      .from('agencies')
      .select('*')
      .eq('owner_id', ownerId)
      .single();

    if (agencyData) {
      agency = agencyData as Agency;
    }
  }

  return (
    <ScanResultsClient
      scan={scan}
      agency={agency}
    />
  );
}
